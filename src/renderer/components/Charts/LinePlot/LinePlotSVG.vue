<template>
<div>
    <svg ref="canvas" :width="width" :height="height" @mousemove="handleHover" @mouseleave="hoverItem = undefined">
        <g class="plot-area" :transform="`translate(${margin.left}, ${margin.top})`">
            <template v-for="(sdata, g) in groupedData" :key="g">
                <g class="series" :data-series="`${g}`">
                    <g class="series-line" v-if="showLines">
                        <path
                            :data-series="g"
                            :d="seriesPath(sdata) as string"
                            :stroke="scale.c(g)"
                            :stroke-width="lineWeight"
                            fill="none" />
                    </g>
                    <g class="series-points">
                        <template v-for="p in sdata" :key="`${p[seriesKey]}-${p[varKey]}`">
                            <g :data-series="`${p[seriesKey]}`" :data-var="`${p[varKey]}`">
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
                                    v-if="showPoints && isPointValid(p)"
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


<script setup lang="ts">
import { throttle } from '@render/util/Events';
import ToolTip from '@render/components/Charts/ToolTip.vue';
import MessageBox from '@render/components/Charts/CenteredMessage.vue';
import { LinePlotBaseProps, LinePlotBasePropsDefaults, LinePlotBaseEmits, useLinePlotBase } from './LinePlotBase.vue';



function default_tooltip_formatter(value: any, that) {
    return JSON.stringify(value, undefined, '\t');
}




const props = withDefaults(defineProps<LinePlotBaseProps>(), LinePlotBasePropsDefaults);
const emit = defineEmits<LinePlotBaseEmits>();
const {tooltipPosition, hoverItem, tooltip_text, scale, innerHeight, innerWidth, seriesPath, margin, rotate_labels, xAxisLabelYPos, origin, groupedData, isPointValid} = useLinePlotBase(props);

function handleClick(event: Event) {
    // Fire when line plot is clicked
    // @arg An event, the series, var, and value of the line plot
    emit('lineplot-click', {
        e: event,
        series: (event.target as SVGCircleElement).dataset.series as string,
        var: (event.target as SVGRectElement).dataset.var as string,
        value: (event.target as SVGRectElement).dataset.value as string,
    });
}
const handleHover = throttle((event: MouseEvent) => {
    if (event && event.target !== null){
        const target = event.target as HTMLElement;
        // individual points have data-var set
        if (target.dataset.var) {
            tooltipPosition.value = {
                x: event.clientX,
                y: event.clientY
            };
            hoverItem.value = props.data.find((itm) => {
                return itm[props.varKey].toString() === target.dataset.var
                    && itm[props.seriesKey].toString() === target.dataset.series;
            });
            return;
        }
    }
    tooltipPosition.value = undefined;
    hoverItem.value = undefined;
}, 10);
</script>


<style scoped>
svg :deep(g.x-axis text.label),
svg :deep(g.y-axis text.label) {
    text-anchor:middle;
    fill:#000;
    font-family: Verdana,Arial,sans-serif;
    font-size: 12px;
}
svg :deep(g.x-axis.rotate g.tick text) {
    transform: translate(-10px,0px) rotate(-45deg);
    text-anchor: end;
}
svg :deep(line),
svg :deep(rect) {
    shape-rendering: crispEdges;
}
svg :deep(circle),
svg :deep(path) {
    shape-rendering: geometricPrecision;
}
</style>