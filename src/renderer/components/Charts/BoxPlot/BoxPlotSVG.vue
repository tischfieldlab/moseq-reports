<template>
  <div>
    <svg ref="canvas" :width="width" :height="height" @mousemove="debouncedHover" @mouseleave="hoverItem = undefined">
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <g v-if="show_boxplot">
          <template v-for="node in groupedData" :key="node.group">
            <g class="boxplot">
              <!-- Vertical midline -->
              <line 
                :data-group="node.group"
                stroke="#000000"
                :x1="scale.x(node.group) + halfBandwith"
                :y1="scale.y(fences.lower(node))"
                :x2="scale.x(node.group) + halfBandwith"
                :y2="scale.y(fences.upper(node))" />

              <!-- Box of the BoxPlot -->
              <rect 
                :data-group="node.group"
                stroke="#000000"
                :width="halfBandwith * 2"
                :height="Math.abs(scale.y(node.q3) - scale.y(node.q1)) || 0"
                :x="scale.x(node.group)"
                :y="scale.y(node.q3)"  
                :style="{ fill: scale.c(node.group) }" />

              <!-- Horizontal Minimum line -->
              <line 
                :data-group="node.group"
                stroke="#000000"
                :x1="scale.x(node.group) + quaterBandwith"
                :y1="scale.y(fences.lower(node))"
                :x2="scale.x(node.group) + (halfBandwith + quaterBandwith)"
                :y2="scale.y(fences.lower(node))" />

              <!-- Horizontal Median line -->
              <line 
                :data-group="node.group"
                stroke="#000000"
                :x1="scale.x(node.group)"
                :y1="scale.y(node.q2)"
                :x2="scale.x(node.group) + halfBandwith * 2"
                :y2="scale.y(node.q2)" />

              <!-- Horizontal Maximum line -->
              <line 
                :data-group="node.group"
                stroke="#000000"
                :x1="scale.x(node.group) + quaterBandwith"
                :y1="scale.y(fences.upper(node))"
                :x2="scale.x(node.group) + (halfBandwith + quaterBandwith)"
                :y2="scale.y(fences.upper(node))" />

              <!-- Outliers -->
              <g class="outliers">
                <template v-for="point in points" :key="point.id">
                  <path
                    v-if="is_outlier(point)"
                    :data-identifier="point.id"
                    :d="diamond()"
                    :transform="`translate(${scale.x(point.group) + point.jitter + halfBandwith}, ${scale.y(point.value)})`"
                    :style="{ fill: scale.c(point.group), stroke: '#000000' }"
                  />
                </template>
              </g>
            </g>
          </template>
        </g>

        <!-- Violin plot -->
        <g v-if="show_violinplot">
          <template v-for="node in groupedData" :key="node.group">
            <g class="violin" :transform="`translate(${scale.x(node.group)}, 0)`">
              <path :d="violinArea(node.kde)" :style="{ fill: scale.c(node.group) }" />
            </g>
          </template>
        </g>

        <!-- Points -->
        <g v-if="actuallyShowPoints" class="node">
          <template v-for="node in points" :key="node.id">
            <path
              v-if="is_outlier(node)"
<<<<<<< HEAD
=======
              :key="node.id"
>>>>>>> 02bec58ab107fd45fb9ddafdb43eb11270fb9a22
              :data-identifier="node.id"
              :d="diamond()"
              :transform="`translate(${scale.x(node.group) + node.jitter + halfBandwith}, ${scale.y(node.value)})`"
              :style="{ fill: scale.c(node.group), stroke: '#000000' }"
            />
            <circle
              v-else
<<<<<<< HEAD
=======
              :key="node.id"
>>>>>>> 02bec58ab107fd45fb9ddafdb43eb11270fb9a22
              :data-identifier="node.id"
              :r="point_size"
              :cx="scale.x(node.group) + node.jitter + halfBandwith"
              :cy="scale.y(node.value)"
              :style="{ fill: scale.c(node.group), stroke: '#000000' }"
            />
          </template>
        </g>

        <!-- X and Y axes -->
        <g :class="{ 'x-axis': true, rotate: rotate_labels }" v-axis:x="scale" :transform="`translate(${origin.x},${origin.y})`">
          <text class="label" :y="xAxisLabelYPos" :x="innerWidth / 2">{{ xAxisTitle }}</text>
        </g>
        <g class="y-axis" v-axis:y="scale">
          <text class="label" transform="rotate(-90)" :y="-45" :x="0 - innerHeight / 2">{{ yAxisTitle }}</text>
        </g>
      </g>
    </svg>
    <MessageBox :show="!has_data">{{ noDataMessage }}</MessageBox>
    <ToolTip :position="tooltipPosition" :show="hoverItem !== undefined">
      <div v-html="tooltip_text" style="text-align: left"></div>
    </ToolTip>
  </div>
</template>


<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import * as d3 from "d3";
import { useBoxPlotBase } from "@render/components/Charts/BoxPlot/BoxPlotBase.vue";
import ToolTip from "@render/components/Charts/ToolTip.vue";
import MessageBox from "@render/components/Charts/CenteredMessage.vue";
import { throttle } from "@render/util/Events";
import { sum } from "d3-array";
import {  WhiskerType} from "@render/components/Charts/BoxPlot";
const props = defineProps({
  data: Array,
  width: Number,
  height: Number,
  whisker_type: { type: String, default: WhiskerType.TUKEY },
  show_boxplot: { type: Boolean, default: true },
  show_points: { type: Boolean, default: true },
  show_violinplot: { type: Boolean, default: false },
  kde_scale: { type: Number, default: 0.01 },
  point_size: { type: Number, default: 2 },
  groupLabels: Array,
  groupColors: Array,
  xAxisTitle: { type: String, default: 'Group' },
  yAxisTitle: { type: String, default: 'Value' },
  tooltipFormatter: Function,
  noDataMessage: { type: String, default: 'Sorry, no data available!' },
});

const { points,
    groupedData,
    has_data,
    scale,
    fences,
    diamond,
    violinArea,
    violinLine,
    margin,
    origin,
    tooltip_text,
    tooltipPosition,
    hoverItem,
    actuallyShowPoints,
    is_outlier,
    halfBandwith,
    quaterBandwith,
    xAxisLabelYPos,
    innerHeight,
    innerWidth,
    rotate_labels,
    noDataMessage } = useBoxPlotBase(props);

//const BoxPlotBase = ref(null);
const canvas = ref(null);
const debouncedHover = ref(() => {});
const labelStats = ref({ count: 0, total: 0, longest: 0 });
console.log("x axis label y pos",xAxisLabelYPos);
const computeLabelStats = (labels) => {
  nextTick(() => {
    if (!canvas.value) return;
    const tag = document.createElementNS("http://www.w3.org/2000/svg", "text");
    canvas.value.appendChild(tag);

    const widths = labels.map(label => {
      tag.textContent = label;
      return tag.getBBox().width;
    });

    canvas.value.removeChild(tag);

    labelStats.value = {
      count: labels.length,
      total: sum(widths),
      longest: Math.max(...widths)
    };
  });
};


// Handle tooltip hover
const handleHover = (event) => {
  if (!event?.target) return;
  const target = event.target;

  if (target.dataset.identifier) {
    tooltipPosition.value = { x: event.clientX, y: event.clientY };
    hoverItem.value = points.value.find(itm => itm.id.toString() === target.dataset.identifier);
  } else if (target.dataset.group) {
    tooltipPosition.value = { x: event.clientX, y: event.clientY };
    hoverItem.value = groupedData.value.find(itm => itm.group.toString() === target.dataset.group);
  } else {
    tooltipPosition.value = undefined;
    hoverItem.value = undefined;
  }
};

// const directives = {
//   axis:{
//     mounted: (el, binding) => {
//       if (!binding.value) return;
//       const axis = binding.arg;
//       const axisMethod = { x: d3.axisBottom, y: d3.axisLeft }[axis];
//       d3.select(el).call(axisMethod(binding.value));
//     }
//   }
// };

const axis = {
  updated: (el, binding) => {
    if (!binding.value) return;
    const axis = binding.arg;
    const axisMethod = { x: d3.axisBottom, y: d3.axisLeft }[axis];
    d3.select(el).call(axisMethod(binding.value));
  }
};


// Lifecycle hooks
onMounted(() => {
  debouncedHover.value = throttle(handleHover, 10);
});



</script>

<style scoped>
svg:deep() g.x-axis text.label,
svg:deep() g.y-axis text.label {
  text-anchor: middle;
  fill: #000000;
  font-family: Verdana, Arial, sans-serif;
  font-size: 12px;
}
svg:deep() text.tick-measurement,
svg:deep() g.tick text {
  font-size: 10px;
  fill: #000000;
}

svg:deep() g.x-axis.rotate g.tick text {
  transform: translate(-10px, 0px) rotate(-45deg);
  text-anchor: end;
}
svg:deep() line,
svg:deep() rect {
  shape-rendering: crispEdges;
}
svg:deep() circle,
svg:deep() path {
  shape-rendering: geometricPrecision;
}
</style>
