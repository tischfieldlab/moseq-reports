<template>
  <g class="legend">
    <!-- Gradient Definition -->
    <defs>
      <linearGradient :id="gradientId" :x1="offsets.x1" :x2="offsets.x2" :y1="offsets.y1" :y2="offsets.y2">
        <stop
          v-for="d in stops"
          :key="`${d.v}_${d.z}`"
          :offset="`${d.v}%`"
          :stop-color="d.z"
        />
      </linearGradient>
    </defs>

    <!-- Gradient Bar -->
    <rect
      :x="-width / 2"
      :y="0"
      :width="width"
      :height="height"
      :fill="`url(#${gradientId})`"
    />

    <!-- Axis -->
    <g ref="axisRef" :transform="`translate(${axis_translate.x},${axis_translate.y})`" />

    <!-- Label -->
    <text class="label"
      :x="label_translate.x"
      :y="label_translate.y"
      :transform="`rotate(${label_translate.r})`"
    >
      {{ title }}
    </text>
  </g>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick, watch } from "vue";
import * as d3 from "d3";
import { scaleLinear } from "d3-scale";
import { axisBottom, axisRight } from "d3-axis";
import { Orientation } from "./ColorScaleLegendBase";

export default defineComponent({
  name: "ColorScaleLegendSVG",
  props: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    scale: { type: Function, required: true },
    title: { type: String, required: true },
    orientation: { type: String, default: Orientation.Horizontal },
    maxticks: { type: Number, default: 5 },
    minticks: { type: Number, default: 1 },
    tickformat: { type: String, default: null },
  },

  setup(props) {
    const axisRef = ref<SVGGElement | null>(null);
    const gradientId = computed(() => `color-gradient-${props.title.replace(/\s+/g, "-")}`);

    // ✅ Ensure scale stops are reactive and computed correctly
    const stops = computed(() => {
      if (!props.scale || typeof props.scale !== "function") return [];
      const domain = props.scale.domain();
      if (domain.length < 2) return [];

      const start = domain[0];
      const stop = domain[domain.length - 1];

      return d3.range(start, stop, (stop - start) / 20).map((v) => ({
        v: ((v - start) / (stop - start)) * 100,
        z: props.scale(v),
      }));
    });

    const offsets = computed(() => {
      return props.orientation === Orientation.Horizontal
        ? { x1: "0%", x2: "100%", y1: "0%", y2: "0%" }
        : { x1: "0%", x2: "0%", y1: "100%", y2: "0%" };
    });

    const axis_translate = computed(() => {
      return props.orientation === Orientation.Horizontal
        ? { x: 0, y: props.height }
        : { x: props.width / 2, y: props.height / 2 };
    });

    const label_translate = computed(() => {
      return props.orientation === Orientation.Horizontal
        ? { x: 0, y: props.height + 20, r: 0 }
        : { x: -props.height / 2, y: props.width + 20, r: -90 };
    });

    // ✅ Ensure linear scale matches props.scale
    const linearscale = computed(() => {
      if (!props.scale || typeof props.scale !== "function") return scaleLinear();
      const domain = props.scale.domain();
      const rangeValues =
        props.orientation === Orientation.Horizontal
          ? [-props.width / 2, props.width / 2]
          : [props.height / 2, -props.height / 2];

      return scaleLinear().domain([domain[0], domain[domain.length - 1]]).range(rangeValues);
    });

    // ✅ Correct tick count calculation
    const calculateNumTicks = () => {
      if (!axisRef.value) return props.maxticks;

      const nodes = d3
        .select(axisRef.value)
        .selectAll("g.tick text")
        .nodes()
        .map((n) => (n as SVGTextElement).getBBox());

      const maxWidth = Math.max(...nodes.map((n) => n.width), 10);
      const maxHeight = Math.max(...nodes.map((n) => n.height), 10);

      let numTicks =
        props.orientation === Orientation.Horizontal
          ? props.width / (maxWidth * 2)
          : props.height / maxHeight;

      return Math.max(props.minticks, Math.min(numTicks, props.maxticks));
    };

    // ✅ Fix axis rendering issue
    const renderAxis = () => {
      if (!axisRef.value) return;

      const axisType = props.orientation === Orientation.Horizontal ? axisBottom : axisRight;
      const axis = axisType(linearscale.value);

      const numTicks = calculateNumTicks();
      axis.ticks(Math.round(numTicks), props.tickformat);

      d3.select(axisRef.value).call(axis as any);
    };

    // ✅ Watch for scale changes
    watch(() => props.scale, () => {
      nextTick(renderAxis);
    }, { deep: true, immediate: true });

    onMounted(() => {
      nextTick(renderAxis);
    });

    return {
      axisRef,
      gradientId,
      offsets,
      axis_translate,
      label_translate,
      linearscale,
      stops,
    };
  },
});
</script>

<style>
g.legend text.label {
  font-family: Verdana, Arial, sans-serif;
  font-size: 13px;
  text-anchor: middle;
  fill: #000;
}
g.legend g.tick line {
  stroke: #888;
  shape-rendering: crispEdges;
}
g.legend g.tick text,
g.legend text.label {
  fill: #888;
}
g.legend path.domain {
  stroke: none;
}
</style>
