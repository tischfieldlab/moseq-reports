<template>
<div>
    <svg ref="canvas" :width="width" :height="height" @mousemove="debouncedHover" @mouseleave="hoverItem = undefined">
        <g class="plot-area" :transform="`translate(${margin.left}, ${margin.top})`">
            <template v-for="(sdata, g) in groupedData">
                <g class="series" :key="g" :data-series="`${g}`">
                    <g class="series-line" v-if="showLines">
                        <path
                            :data-series="g"
                            :d="seriesPath(sdata)"
                            :stroke="scale.c(g)"
                            :stroke-width="lineWeight"
                            fill="none" />
                    </g>
                    <g class="series-points" v-if="showPoints">
                        <template v-for="p in sdata">
                            <g :key="`${p[seriesKey]}-${p[varKey]}`" :data-series="`${p[seriesKey]}`" :data-var="`${p[varKey]}`">
                                <g v-if="errorKey && showError" class="error">
                                    <line class="error"
                                        :x1="scale.x(p[varKey])"
                                        :x2="scale.x(p[varKey])"
                                        :y1="scale.y(p[valueKey] - p[errorKey])"
                                        :y2="scale.y(p[valueKey] + p[errorKey])"
                                        :stroke="scale.c(g)"
                                        :stroke-width="lineWeight / 2"
                                        />
                                    <line class="error"
                                        :x1="scale.x(p[varKey]) - (scale.x.step() / 8)"
                                        :x2="scale.x(p[varKey]) + (scale.x.step() / 8)"
                                        :y1="scale.y(p[valueKey] + p[errorKey])"
                                        :y2="scale.y(p[valueKey] + p[errorKey])"
                                        :stroke="scale.c(g)"
                                        :stroke-width="lineWeight / 2"
                                        />
                                    <line class="error"
                                        :x1="scale.x(p[varKey]) - (scale.x.step() / 8)"
                                        :x2="scale.x(p[varKey]) + (scale.x.step() / 8)"
                                        :y1="scale.y(p[valueKey] - p[errorKey])"
                                        :y2="scale.y(p[valueKey] - p[errorKey])"
                                        :stroke="scale.c(g)"
                                        :stroke-width="lineWeight / 2"
                                        />
                                </g>
                                <circle
                                    v-if="isPointValid(p)"
                                    @click="handleClick"
                                    :data-series="`${p[seriesKey]}`"
                                    :data-var="`${p[varKey]}`"
                                    :data-value="p[valueKey]"
                                    :r="pointSize"
                                    :cx="scale.x(p[varKey])"
                                    :cy="scale.y(p[valueKey])"
                                    :style="{'fill': scale.c(p[seriesKey]), stroke: '#000000'}" />
                            </g>
                        </template>
                    </g>
                </g>
            </template>
        </g>
        <g :class="{'x-axis':true, 'rotate': rotate_labels }" v-axis:x="scale" :transform="`translate(${margin.left},${origin.y})`">
            <text class="label" :y="xAxisLabelYPos" :x="(innerWidth / 2)">
                {{xAxisTitle}}
            </text>
        </g>
        <g class="y-axis" v-axis:y="scale" :transform="`translate(${margin.left},${margin.top})`">
            <text class="label" transform="rotate(-90)" :y="-45" :x="0 - (innerHeight/2)">
                {{yAxisTitle}}
            </text>
        </g>
    </svg>
    <ToolTip :position="tooltipPosition" :show="hoverItem !== undefined">
        <div v-html="tooltip_text" style="text-align:left;"></div>
    </ToolTip>
</div>
</template>


<script lang="ts">
import mixins from 'vue-typed-mixins';
import Vue, { PropType } from 'vue'
import * as d3 from 'd3';
import { throttle } from '@/util/Events';
import ToolTip from '@/components/Charts/ToolTip.vue';
import MessageBox from '@/components/Charts/CenteredMessage.vue';
import LinePlotBase from './LinePlotBase.vue';



function default_tooltip_formatter(value: any, that) {
    return JSON.stringify(value, undefined, '\t');
}


export default mixins(LinePlotBase).extend({
    components: {
        ToolTip,
        MessageBox,
    },
    data() {
        return {
            debouncedHover: (event: MouseEvent) => {/**/},
        };
    },
    mounted() {
        this.debouncedHover = throttle(this.handleHover, 10);
    },
    methods: {
        handleClick(event: Event) {
            this.$emit('lineplot-click', {
                e: event,
                series: (event.target as SVGCircleElement).dataset.series,
                var: (event.target as SVGRectElement).dataset.var,
                value: (event.target as SVGRectElement).dataset.value,
            });
        },
        handleHover(event: MouseEvent) {
            if (event && event.target !== null){
                const target = event.target as HTMLElement;
                // individual points have data-var set
                if (target.dataset.var) {
                    this.tooltipPosition = {
                        x: event.clientX,
                        y: event.clientY
                    };
                    this.hoverItem = this.data.find((itm) => {
                        return itm[this.varKey].toString() === target.dataset.var
                            && itm[this.seriesKey].toString() === target.dataset.series;
                    });
                    return;
                }
            }
            this.tooltipPosition = undefined;
            this.hoverItem = undefined;
        },
    },
    directives: {
        axis(el, binding) {
            const axis = binding.arg;
            if (axis !== undefined) {
                const axisMethod = { x: 'axisBottom', y: 'axisLeft' }[axis] as string;
                const methodArg = binding.value[axis];
                d3.select(el).call(d3[axisMethod](methodArg));
            }
        },
    },
});
</script>


<style scoped>
svg >>> g.x-axis text.label,
svg >>> g.y-axis text.label {
    text-anchor:middle;
    fill:#000;
    font-family: Verdana,Arial,sans-serif;
    font-size: 12px;
}
svg >>> g.x-axis.rotate g.tick text {
    transform: translate(-10px,0px) rotate(-45deg);
    text-anchor: end;
}
svg >>> line,
svg >>> rect {
    shape-rendering: crispEdges;
}
svg >>> circle,
svg >>> path {
    shape-rendering: geometricPrecision;
}
</style>