<template>
  <svg :height="height" :width="width">
    <defs>
      <linearGradient :id="$id('color-gradiant')" :x1="offsets.x1" :x2="offsets.x2" :y1="offsets.y1" :y2="offsets.y2">
        <template v-for="d in scale">
          <stop :key="`${d.v}_${d.z}`" :offset="`${d.v}%`" :stop-color="d.z" />
        </template>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" :fill="`url(${$idRef('color-gradiant')})`" />
  </svg>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import { scaleSequential } from "d3-scale";
import { GetScale } from "@render/components/Charts/Colors/D3ColorProvider";
import { range } from "d3-array";

export default defineComponent({
  props: {
    // Width of color scale bar
    width: {
      type: String,
      default: "100%",
    },
    // Height of color scale bar
    height: {
      type: String,
      default: "20px",
    },
    // Orientation of color scale bar, either vertical or horizontal
    orientation: {
      type: String,
      default: "horizontal",
      validator: (value: any) => {
        return ["horizontal", "vertical"].indexOf(value) !== -1;
      },
    },
    // Interpolator of color scale bar
    interpolator: {
      type: String,
      required: true,
    },
  },
  computed: {
    offsets() {
      if (this.orientation === "horizontal") {
        return {
          x1: "0%",
          x2: "100%",
          y1: "0%",
          y2: "0%",
        };
      } else {
        return {
          x1: "0%",
          x2: "0%",
          y1: "100%",
          y2: "0%",
        };
      }
    },
    scale() {
      const z = scaleSequential(GetScale(this.interpolator) as (t: number) => string).domain([0, 1]);
      return range(0, 1.1, 0.05).map((v) => ({ v: v * 100, z: z(v) }));
    },
  },
});
</script>
