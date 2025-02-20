<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import * as d3 from 'd3';
import { scaleLinear, scaleBand, scaleOrdinal } from 'd3-scale';
import { area, line, symbol, symbolDiamond } from 'd3-shape';
import { WhiskerType } from './BoxPlot.types';
// Import Worker using Vite's worker syntax
import Worker from './Worker.ts?worker';

function default_tooltip_formatter(value) {
  if (value) {
    if (value.id !== undefined) {
      return `ID: ${value.id}<br /> Value: ${value.value.toExponential(3)}`;
    } else if (value.count !== undefined) {
      return `Group: ${value.group}<br /> Count: ${value.count}<br /> Median: ${value.q2.toExponential(3)}`;
    } else {
      return JSON.stringify(value, null, "\t");
    }
  }
  return "";
}

export function useBoxPlotBase(props) {
  const worker = new Worker();

  worker.onmessage = (event) => {
    console.log("Worker Message Received:", event.data);
    if (event.data.type === "preparedData") {
      points.value = event.data.cleanedResult.points;
      groupedData.value = event.data.cleanedResult.groupedData;
      domainY.value = event.data.cleanedResult.domainY;
      domainKde.value = event.data.cleanedResult.domainKde;
    } else if (event.data.type === "swarmPointsUpdated") {
      points.value = event.data.result;
    }
  };

  const points = ref([]);
  const groupedData = ref([]);
  const margin = ref({ top: 20, right: 20, bottom: 50, left: 60 });
  const xAxisLabelYPos = ref(45);
  const rotate_labels = ref(false);
  const label_stats = ref({ count: 0, total: 0, longest: 0 });
  const domainY = ref([0, 0]);
  const domainKde = ref([0, 0]);
  const tooltipPosition = ref(undefined);
  const hoverItem = ref(undefined);

  const has_data = computed(() => props.data?.length > 0);

  // ✅ Fix: Restored proper sorting of `groupLabels`
  const scale = computed(() => {
    const orderedLabels = groupedData.value.map(gs => gs.group).sort((a, b) => 
      props.groupLabels.indexOf(a) - props.groupLabels.indexOf(b)
    );
    const x = scaleBand()
      .domain(orderedLabels)
      .range([0, innerWidth.value])
      .padding(0.2);

    return {
      x,
      y: scaleLinear().domain(domainY.value).range([innerHeight.value, 0]),
      w: scaleLinear().domain(domainKde.value).range([0, x.bandwidth()]),
      c: scaleOrdinal().domain(props.groupLabels).range(props.groupColors),
    };
  });

  const innerWidth = computed(() => {
    const width = props.width - margin.value.left - margin.value.right;

    rotate_labels.value = label_stats.value.longest > width / label_stats.value.count;
    
    if (rotate_labels.value) {
      const rotatedHeight = Math.cos(45 * (Math.PI / 180)) * label_stats.value.longest;
      xAxisLabelYPos.value = rotatedHeight + 20;
    } else {
      xAxisLabelYPos.value = 45;
    }
    margin.value.bottom = xAxisLabelYPos.value + 20;
    
    return width;
  });

  const innerHeight = computed(() => props.height - margin.value.top - margin.value.bottom);
  const halfBandwith = computed(() => scale.value.x.bandwidth() / 2);
  const quaterBandwith = computed(() => scale.value.x.bandwidth() / 4);
  const origin = computed(() => ({ x: scale.value.x.range()[0], y: scale.value.y.range()[0] }));

  // ✅ Fix: Ensured `fences` calculation remains the same as old logic
  const fences = computed(() => {
    switch (props.whisker_type) {
      case WhiskerType.MIN_MAX:
        return {
          lower: (gs) => gs.min,
          upper: (gs) => gs.max,
        };
      case WhiskerType.TUKEY:
        return {
          lower: (gs) => Math.max(gs.q1 - 1.5 * gs.iqr, gs.min),
          upper: (gs) =>Math.min(gs.q3 + 1.5 * gs.iqr, gs.max),
        };
      default:
        throw new Error(`Unsupported Whisker Type ${props.whisker_type}!`);
    }
  });

  const violinArea = computed(() => area().x0(d => scale.value.w(d[1])).x1(d => scale.value.w(-d[1])).y(d => scale.value.y(d[0])));
  const violinLine = computed(() => line().x(d => scale.value.w(d[1])).y(d => scale.value.y(d[0])));
  const diamond = computed(() => symbol().type(symbolDiamond).size(2 * Math.sqrt(2 * (Math.PI * props.point_size ** 2))));
  const actuallyShowPoints = computed(() => props.show_points && points.value.length <= 10000);

  const tooltip_text = computed(() => 
    hoverItem.value 
      ? (props.tooltipFormatter || default_tooltip_formatter)(hoverItem.value) 
      : ''
  );

  const prepareData = (newData) => {
    if (!newData) return;
    worker.postMessage({
      type: "prepareData",
      payload: JSON.parse(JSON.stringify({
        points: newData,
        height: props.height,
        pointSize: props.point_size,
        groupLabels: props.groupLabels,
        swarmPoints: props.show_points,
        kdeScale: props.kde_scale,
        whiskerType: props.whisker_type,
      })),
    });
  };

  // ✅ Fix: Ensured swarm points update remains consistent
  const updateSwarmPoints = async () => {
    worker.postMessage({
      type: "updateSwarmPoints",
      payload: {
        points: points.value,
        groupLabels: props.groupLabels,
        yScale: { domain: scale.value.y.domain(), range: scale.value.y.range() },
        pointSize: props.point_size,
      },
    });
  };

  const is_outlier = (node) => {
    const group = groupedData.value.find((v) => v.group === node.group);
      //if (group) {
    //console.log(`🛠 [DEBUG] Node: ${node.id}, Value: ${node.value}, Lower: ${fences.value.lower(group)}, Upper: ${fences.value.upper(group)}`);
  //}
    return group ? node.value < fences.value.lower(group) || node.value > fences.value.upper(group) : false;
  };

  watch(() => props.data, (newData) => { if (newData) prepareData(newData); }, { immediate: true });
  watch(() => props.point_size, () => { updateSwarmPoints(); });

  const handleHover = (event) => {
    if (event.target) {
      const target = event.target;
      if (target.dataset.identifier) {
        tooltipPosition.value = { x: event.clientX, y: event.clientY };
        hoverItem.value = points.value.find(itm => itm.id.toString() === target.dataset.identifier);
      }
    }
  };

  onUnmounted(() => { worker.terminate(); document.removeEventListener('mousemove', handleHover); });
  onMounted(() => { document.addEventListener('mousemove', handleHover); });

  return { points, groupedData, has_data, scale, fences, diamond, violinArea, violinLine, margin, origin, tooltip_text, tooltipPosition, hoverItem, actuallyShowPoints, is_outlier, halfBandwith, quaterBandwith, xAxisLabelYPos, innerHeight, innerWidth, rotate_labels, noDataMessage: props.noDataMessage };
}
</script>
