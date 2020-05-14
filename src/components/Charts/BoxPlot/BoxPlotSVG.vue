<template>
    <svg ref="canvas" :width="width" :height="height" >
        <g v-if="show_boxplot" :transform="`translate(${margin.left}, ${margin.top})`">
            <template v-for="(node) in groupedData">
                <g class="boxplot" :key="node.group">
                    <!-- Vertical midline -->
                    <line 
                        stroke="#000000"
                        :x1="scale.x(node.group) + halfBandwith"
                        :y1="scale.y(fences.lower(node))"
                        :x2="scale.x(node.group) + halfBandwith"
                        :y2="scale.y(fences.upper(node))" />
                    <!-- the Box of the BoxPlot -->
                    <rect 
                        stroke="#000000"
                        :width="halfBandwith * 2"
                        :height="scale.y(node.q3) - scale.y(node.q1)"
                        :x="scale.x(node.group)"
                        :y="scale.y(node.q1)"
                        :style="{'fill': scale.c(node.group)}" />
                    <!-- Horizontal Minimum line -->
                    <line 
                        stroke="#000000"
                        :x1="scale.x(node.group) + quaterBandwith"
                        :y1="scale.y(fences.lower(node))"
                        :x2="scale.x(node.group) + (halfBandwith + quaterBandwith)"
                        :y2="scale.y(fences.lower(node))" />
                    <!-- Horizontal Median line -->
                    <line 
                        stroke="#000000"
                        :x1="scale.x(node.group)"
                        :y1="scale.y(node.q2)"
                        :x2="scale.x(node.group) + (halfBandwith * 2)"
                        :y2="scale.y(node.q2)" />
                    <!-- Horizontal Maximum line -->
                    <line 
                        stroke="#000000"
                        :x1="scale.x(node.group) + quaterBandwith"
                        :y1="scale.y(fences.upper(node))"
                        :x2="scale.x(node.group) + (halfBandwith + quaterBandwith)"
                        :y2="scale.y(fences.upper(node))" />

                    <g class="outliers">
                        <template v-for="(node) in points">
                            <!-- Circles for each node v-b-tooltip.html :title="point_tooltip(node)" -->
                            <path v-if="is_outlier(node)"
                                :key="node.id"
                                :d="diamond()"
                                :transform="`translate(${scale.x(node.group) + node.jitter + halfBandwith}, ${scale.y(node.value)})`"
                                :style="{'fill': scale.c(node.group), stroke: '#000000'}" />
                        </template>
                    </g>
                </g>
            </template>
        </g>
        <g v-if="show_violinplot" :transform="`translate(${margin.left}, ${margin.top})`">
            <template v-for="(node) in groupedData">
                <g class="violin" :key="node.group" :transform="`translate(${scale.x(node.group)}, 0)`">
                    <path :d="violinArea(node.kde)" :style="{'fill': scale.c(node.group)}" />
                </g>
            </template>
        </g>
        <g v-if="show_points" class="node" :transform="`translate(${margin.left}, ${margin.top})`">
            <template v-for="(node) in points">
                <!-- Circles for each node v-b-tooltip.html :title="point_tooltip(node)" -->
                <path v-if="is_outlier(node)"
                    :key="node.id"
                    :d="diamond()"
                    :transform="`translate(${scale.x(node.group) + node.jitter + halfBandwith}, ${scale.y(node.value)})`"
                    :style="{'fill': scale.c(node.group), stroke: '#000000'}" />
                    
                <circle v-else
                    :key="node.id"
                    :r="point_size"
                    :cx="scale.x(node.group) + node.jitter + halfBandwith"
                    :cy="scale.y(node.value)"
                    :style="{'fill': scale.c(node.group), stroke: '#000000'}" />
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
</template>

<script lang="ts">
import Vue from 'vue';
import * as d3 from 'd3';
import { axisBottom, axisLeft } from 'd3-axis';
import BoxPlotBase from './BoxPlotBase.vue';
import { sum } from 'd3-array';



export default BoxPlotBase.extend({
    methods: {
        compute_label_stats(labels: string[]) {
            const canvas = this.$refs.canvas as SVGSVGElement;
            if (canvas === undefined) {
                // if canvas is not available yet (i.e. before fully mounted)
                // then schedule the calculation for the next tick
                this.$nextTick(() => this.compute_label_stats(labels));
                return;
            }
            const tag = document.createElementNS('http://www.w3.org/2000/svg', 'text') as SVGTextElement;
            canvas.appendChild(tag);
            const widths = labels.map((l) => {
                tag.textContent = l;
                return tag.getBBox().width;
            });
            canvas.removeChild(tag);
            this.label_stats = {
                count: labels.length,
                total: sum(widths),
                longest: Math.max(...widths),
            };
        },
    },
    directives: {
        axis(el, binding) {
            const axis = binding.arg;
            if (axis !== undefined) {
                const axisMethod = { x: 'axisBottom', y: 'axisLeft' }[axis];
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