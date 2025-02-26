import { defineComponent, computed } from "vue";
import { scaleLinear, ScaleLinear } from "d3-scale";
import { range } from "d3-array";

export enum Orientation {
  Horizontal = "horizontal",
  Vertical = "vertical",
}

export default defineComponent({
  name: "ColorScaleLegend",
  props: {
    scale: {
      type: [Function, Object],
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    orientation: {
      type: String,
      default: Orientation.Horizontal,
    },
    maxticks: {
      type: Number,
      default: 5,
    },
    minticks: {
      type: Number,
      default: 1,
    },
    tickformat: {
      type: String,
      default: null,
    },
  },

  setup(props) {
    // ✅ Compute gradient offsets
    const offsets = computed(() => {
      return props.orientation === Orientation.Horizontal
        ? { x1: "0%", x2: "100%", y1: "0%", y2: "0%" }
        : { x1: "0%", x2: "0%", y1: "100%", y2: "0%" };
    });
    console.log(props.scale)
    // ✅ Compute axis positioning
    const axis_translate = computed(() => {
      return props.orientation === Orientation.Horizontal
        ? { x: 0, y: props.height }
        : { x: props.width / 2, y: props.height / 2 };
    });

    // ✅ Compute label positioning
    const label_translate = computed(() => {
      return props.orientation === Orientation.Horizontal
        ? { x: 0, y: props.height + 38, r: 0 }
        : { x: -props.height / 2, y: props.width + 38, r: -90 };
    });

    // ✅ Check if horizontal
    const isHorizontal = computed(() => props.orientation === Orientation.Horizontal);

    // ✅ Compute linear scale for legend axis
    const linearscale = computed(() => {
      const rangeValues = isHorizontal.value
        ? [-props.width / 2, props.width / 2]
        : [props.height / 2, -props.height / 2];

      const domain = props.scale.domain();
      return scaleLinear().domain([domain[0], domain[domain.length - 1]]).range(rangeValues);
    });

    // ✅ Compute gradient stops
    const stops = computed(() => {
      const domain = props.scale.domain();
      const start = domain[0];
      const stop = domain[domain.length - 1];

      return range(start, stop, (stop - start) / 20).map((v) => ({
        v: percentRange(v, start, stop),
        z: props.scale(v),
      }));
    });

    // ✅ Convert value to percentage in range
    const percentRange = (value: number, start: number, stop: number): number => {
      return ((value - start) / (stop - start)) * 100;
    };

    return {
      offsets,
      axis_translate,
      label_translate,
      isHorizontal,
      linearscale,
      stops,
      percentRange,
    };
  },
});
