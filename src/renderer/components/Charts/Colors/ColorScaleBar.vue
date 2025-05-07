<template>
    <svg :height="height" :width="width">
      <defs>
        <linearGradient :id="gradientId" :x1="offsets.x1" :x2="offsets.x2" :y1="offsets.y1" :y2="offsets.y2">
          <stop 
            v-for="d in scale"
            :key="`${d.v}_${d.z}`"
            :offset="`${d.v}%`"
            :stop-color="d.z" 
          />
        </linearGradient>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        :fill="`url(#${gradientId})`"
      />
    </svg>
  </template>
  
<script lang="ts">
import { defineComponent, computed } from "vue";
import { scaleSequential } from "d3-scale";
import { GetScale } from "./D3ColorProvider";
import { range } from "d3-array";

export default defineComponent({
  name: "ColorScaleBar",
  props: {
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "20px",
    },
    orientation: {
      type: String,
      default: "horizontal",
      validator: (value: string) => ["horizontal", "vertical"].includes(value),
    },
    interpolator: {
      type: String,
      required: true,
    },
  },

  setup(props) {
  
    const gradientId = computed(() => `color-gradient-${props.interpolator}`);
    const offsets = computed(() => {
      return props.orientation === "horizontal"
        ? { x1: "0%", x2: "100%", y1: "0%", y2: "0%" }
        : { x1: "0%", x2: "0%", y1: "100%", y2: "0%" };
    });

    const scale = computed(() => {
      const z = scaleSequential(GetScale(props.interpolator) as (t: number) => string).domain([0, 1]);
      return range(0, 1.1, 0.05).map((v) => ({ v: v * 100, z: z(v) }));
    });

    return {
      gradientId,
      offsets,
      scale,
    };
  },
});
</script>
