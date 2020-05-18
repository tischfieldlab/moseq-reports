<template>
    <svg ref="canvas" :width="width" :height="height" >
        <g :transform="`translate(${margin.left},${margin.top})`">
            <g
                v-for="cell in scale.gl"
                :key="cell.data"
                :data-group="cell.data"
                :transform="`translate(${cell.pos.x},${cell.pos.y})`"
                class="group">

                <!--<rect
                    :x="(-hexWidth / 2) - 1"
                    :y="-hexHeight / 2 - 3"
                    :width="cell.pos.width + hexWidth + 2"
                    :height="cell.pos.height + hexHeight + 2"
                    stroke="#666"
                    fill="transparent" />-->

                <text
                    :x="cell.pos.width / 2"
                    :y="0"
                    class="label">
                    {{cell.data}}
                </text>

                <template v-for="h in binned[cell.data]">
                    <path
                        :key="h.x+h.y"
                        :d="hexbin.hexagon()"
                        :transform="`translate(${h.x+(cell.pos.paddingX/2)},${h.y+20})`"
                        :fill="scale.c(h.z)"
                        :data-z="h.z"
                        stroke="#000"
                        stroke-opacity="0.1" />
                </template>
            </g>
        </g>
        <text
            :x="width / 2"
            :y="20"
            class="title">
            {{title}}
        </text>
        <ColorScaleLegend
                :title="legendTitle"
                :scale="scale.c"
                :width="200"
                :height="10"
                :transform="`translate(${width / 2},${scale.gl.height + 20})`" />
    </svg>
</template>

<script lang="ts">
import Vue from 'vue';
import { debounce } from 'ts-debounce';
import { hexbin } from 'd3-hexbin';
import { scaleLinear, scaleBand, scaleOrdinal, scaleSequential } from 'd3-scale';
import { max, min, mean, quantile, median, sum, extent } from 'd3-array';
import { GetScale } from '@/util/D3ColorProvider';
import { groupby } from '@/util/Array';
import { spawn, Thread, Worker, ModuleThread } from 'threads';
import { HexbinWorker } from './Worker';
import gridLayout from '@/util/D3Layout';
import ColorScaleLegend from '@/components/Core/ColorScaleLegend.vue';
import LoadingMixin from '@/components/Core/LoadingMixin';
import mixins from 'vue-typed-mixins';
import HexBinPlotBase from './HexBinPlotBase.vue';



export default mixins(HexBinPlotBase).extend({
    components: {
        ColorScaleLegend,
    },
});
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