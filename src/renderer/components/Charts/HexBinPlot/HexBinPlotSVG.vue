<template>
  <div>
    <svg v-show="hasData" :width="width" :height="height">
      <g :transform="`translate(${margin.left},${margin.top})`">
        <g
          v-for="cell in scale.gl"
          :key="cell.data"
          :data-group="cell.data"
          :transform="`translate(${cell.pos.x},${cell.pos.y})`"
          class="group"
        >
          <text
            :x="cell.pos.width / 2"
            :y="0"
            class="label"
          >
            {{ cell.data }}
          </text>

          <path
            v-for="h in binned[cell.data]"
            :key="`${h.x}-${h.y}`"
            :d="hexbing.hexagon()"
            :transform="`translate(${h.x},${h.y + 20})`"
            :fill="scale.c(h.z)"
            :data-z="h.z"
            stroke="#000"
            stroke-opacity="0.1"
          />
        </g>

        <ColorScaleLegend
          :title="legendTitle"
          :scale="scale.c"
          :width="200"
          :height="10"
          :transform="`translate(${width / 2},${innerSize.h})`"
        />
      </g>

      <text
        :x="width / 2"
        :y="20"
        class="title"
      >
        {{ title }}
      </text>
    </svg>

    <MessageBox v-if="!hasData">
      {{ noDataMessage }}
    </MessageBox>
  </div>
</template>

<script setup lang="ts">
import ColorScaleLegend from '@render/components/Charts/Colors/ColorScaleLegendSVG.vue';
import MessageBox from '@render/components/Charts/CenteredMessage.vue';
import { useHexBinPlotBase, HexBinPlotBaseProps, HexBinPlotBasePropsDefaults } from "@render/components/Charts/HexBinPlot/HexBinPlotBase.vue";

const props = withDefaults(defineProps<HexBinPlotBaseProps>(), HexBinPlotBasePropsDefaults);
const {
  margin,
  binned,
  scale,
  hexbing,
  hasData,
  innerSize,
} = useHexBinPlotBase(props);

</script>


<style scoped>
g.group {
    border: 1px solid #666;
}
text.label,
text.title {
    text-anchor:middle;
}
</style>