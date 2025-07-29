<template>
    <div>
        <svg ref="canvas" :width="width" :height="height" @mousemove="handleHover"
            @mouseleave="hoverItem = undefined">
            <g :transform="`translate(${margin.left}, ${margin.top})`">
                <g v-if="show_boxplot">
                    <template v-for="node in groupedData" :key="node.group">
                        <g class="boxplot">
                            <!-- Vertical midline -->
                            <line :data-group="node.group" stroke="#000000" :x1="scale.x(node.group) + halfBandwith"
                                :y1="scale.y(fences.lower(node))" :x2="scale.x(node.group) + halfBandwith"
                                :y2="scale.y(fences.upper(node))" />

                            <!-- Box of the BoxPlot -->
                            <rect :data-group="node.group" stroke="#000000" :width="halfBandwith * 2"
                                :height="Math.abs(scale.y(node.q3) - scale.y(node.q1)) || 0" :x="scale.x(node.group)"
                                :y="scale.y(node.q3)" :style="{ fill: scale.c(node.group) }" />

                            <!-- Horizontal Minimum line -->
                            <line :data-group="node.group" stroke="#000000" :x1="scale.x(node.group) + quaterBandwith"
                                :y1="scale.y(fences.lower(node))"
                                :x2="scale.x(node.group) + (halfBandwith + quaterBandwith)"
                                :y2="scale.y(fences.lower(node))" />

                            <!-- Horizontal Median line -->
                            <line :data-group="node.group" stroke="#000000" :x1="scale.x(node.group)"
                                :y1="scale.y(node.q2)" :x2="scale.x(node.group) + halfBandwith * 2"
                                :y2="scale.y(node.q2)" />

                            <!-- Horizontal Maximum line -->
                            <line :data-group="node.group" stroke="#000000" :x1="scale.x(node.group) + quaterBandwith"
                                :y1="scale.y(fences.upper(node))"
                                :x2="scale.x(node.group) + (halfBandwith + quaterBandwith)"
                                :y2="scale.y(fences.upper(node))" />

                            <!-- Outliers -->
                            <g class="outliers">
                                <template v-for="node in points">
                                    <path v-if="is_outlier(node)" :key="node.id" :data-identifier="node.id"
                                        :d="diamond()"
                                        :transform="`translate(${scale.x(node.group) + node.jitter + halfBandwith}, ${scale.y(node.value)})`"
                                        :style="{ fill: scale.c(node.group), stroke: '#000000' }" />
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


                <g v-if="actuallyShowPoints" class="node">
                    <template v-for="node in points" :key="node.id">
                        <path v-if="is_outlier(node)" :data-identifier="node.id" :d="diamond() as string"
                            :transform="`translate(${scale.x(node.group) as number + node.jitter + halfBandwith}, ${scale.y(node.value)})`"
                            :style="{ fill: scale.c(node.group), stroke: '#000000' }" />
                        <circle v-else :data-identifier="node.id" :r="point_size"
                            :cx="scale.x(node.group) as number + node.jitter + halfBandwith" :cy="scale.y(node.value)"
                            :style="{ fill: scale.c(node.group), stroke: '#000000' }" />
                    </template>
                </g>

                <g :class="{ 'x-axis': true, rotate: rotate_labels }" v-axis:x="scale"
                    :transform="`translate(${origin.x},${origin.y})`">
                    <text class="label" :y="xAxisLabelYPos" :x="innerWidth / 2">
                        {{ xAxisTitle }}
                    </text>
                </g>
                <g class="y-axis" v-axis:y="scale">
                    <text class="label" transform="rotate(-90)" :y="-45" :x="0 - innerHeight / 2">
                        {{ yAxisTitle }}
                    </text>
                </g>
            </g>
        </svg>
        <MessageBox :show="!has_data">{{ noDataMessage }}</MessageBox>
        <ToolTip :position="tooltipPosition" :show="hoverItem !== undefined">
            <div v-html="tooltip_text" style="text-align: left"></div>
        </ToolTip>
    </div>
</template>


<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from "vue";
import * as d3 from "d3";
import { useBoxPlotBase, BoxPlotBaseProps, BoxPlotBasePropsDefaults } from "@render/components/Charts/BoxPlot/BoxPlotBase";
import ToolTip from "@render/components/Charts/ToolTip.vue";
import MessageBox from "@render/components/Charts/CenteredMessage.vue";
import { throttle } from "@render/util/Events";
import { sum } from "d3-array";


const props = withDefaults(defineProps<BoxPlotBaseProps>(), BoxPlotBasePropsDefaults);

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
    rotate_labels
 } = useBoxPlotBase(props);

const canvas = useTemplateRef('canvas');
const labelStats = ref({ count: 0, total: 0, longest: 0 });

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

const handleHover = throttle((event) => {
    if (!event?.target) return;
    const target = event.target;
    
    tooltipPosition.value = { x: event.clientX, y: event.clientY };
    
    if (target.dataset.identifier) {
        hoverItem.value = points.value.find(itm => itm.id.toString() === target.dataset.identifier);
    } else if (target.dataset.group) {
        hoverItem.value = groupedData.value.find(itm => itm.group.toString() === target.dataset.group);
    } else {
        hoverItem.value = undefined;
    }
}, 10);

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
