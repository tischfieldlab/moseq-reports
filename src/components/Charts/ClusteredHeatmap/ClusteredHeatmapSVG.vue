<template>
    <svg ref="canvas" :width="width" :height="height">
        <g class="heatmap" :transform="`translate(${dims.heatmap.x},${dims.heatmap.y})`" v-on:click="handleHeatmapClick">
            <template v-for="node in data">
                <rect 
                    :key="`${node[columnKey]}-${node[rowKey]}`"
                    :x="scale.x(node[columnKey])"
                    :y="scale.y(node[rowKey])"
                    :width="scale.x.bandwidth()"
                    :height="scale.y.bandwidth()"
                    :fill="scale.z(node[valueKey])"
                    :data-row="node[rowKey]"
                    :data-col="node[columnKey]"
                    :data-val="node[valueKey]"
                    /><!-- v-b-tooltip.html :title="heatmap_node_tooltip(node)"-->
            </template>
        </g>
        <g class="rtree" v-show="isRowsClustered" :transform="`translate(${dims.rtree.x},${dims.rtree.y})`">
            <template v-for="(link, index) in rowLinks">
                <path class="rlink" :key="index" :d="elbowH(link)" />
            </template>
        </g>
        <g class="ctree" v-show="isColumnsClustered" text-anchor="middle" :transform="`translate(${dims.ctree.x},${dims.ctree.y})`">
            <template v-for="(link, index) in columnLinks">
                <path class="clink" :key="index" :d="elbowV(link)" />
            </template>
        </g>
        <g class="x-axis" v-axis:x="scale" :transform="`translate(${dims.xaxis.x},${dims.xaxis.y})`">
            <text class="label" :x="dims.xaxis.w/2" :y="dims.xaxis.ly">{{xAxisTitle}}</text>
        </g>
        <g class="y-axis" v-axis:y="scale" :transform="`translate(${dims.yaxis.x},${dims.yaxis.y})`">
            <text class="label" :x="-dims.yaxis.h/2" :y="50" transform="rotate(-90)">{{yAxisTitle}}</text>
        </g>
        <ColorScaleLegend
            :title="legendTitle"
            :scale="scale.z"
            :width="dims.legend.w"
            :height="10"
            :transform="`translate(${dims.legend.x}, ${dims.legend.y})`" />
    </svg>
</template>


<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/Core';
import { HeatmapTile } from './ClusterHeatmap.types';
import * as d3 from 'd3';
import { sum } from 'd3';
import ColorScaleLegend from '@/components/Charts/ColorScaleLegend/ColorScaleLegendSVG.vue';
import mixins from 'vue-typed-mixins';
import ClusteredHeatmapBase from './ClusteredHeatmapBase.vue';



export default mixins(ClusteredHeatmapBase).extend({
    components: {
        ColorScaleLegend,
    },
    methods: {
        compute_label_stats(labels: string[]) {
            const widths = [] as number[];
            const canvas = this.$refs.canvas as SVGSVGElement;
            if (!canvas) { return; }
            const tag = document.createElementNS('http://www.w3.org/2000/svg', 'text') as SVGTextElement;
            canvas.appendChild(tag);
            for (const label of labels) {
                tag.textContent = label;
                widths.push(tag.getBBox().width);
            }
            canvas.removeChild(tag);
            this.label_stats = {
                count: labels.length,
                total: sum(widths),
                longest: Math.max(...widths),
            };
        },
        handleHeatmapClick(event: Event) {
            this.$emit('heatmapClick', {
                e: event,
                row: (event.target as SVGRectElement).dataset.row,
                col: (event.target as SVGRectElement).dataset.col,
                value: (event.target as SVGRectElement).dataset.val,
            });
        },
        showSelectedRow(id: number) {
            const canvas = this.$refs.canvas as ParentNode;
            if (!canvas) {
                return;
            }
            const labels = [...canvas.querySelectorAll('g.y-axis .tick')] as SVGTextElement[];
            for (const l of labels) {
                if (l.getAttribute('data-row') === id.toString()) {
                    l.classList.add('selected');
                } else {
                    l.classList.remove('selected');
                }
            }
        },
        showSelectedCol(id: number) {
            const canvas = this.$refs.canvas as ParentNode;
            if (!canvas) {
                return;
            }
            const labels = [...canvas.querySelectorAll('g.x-axis .tick')] as SVGTextElement[];
            for (const l of labels) {
                if (l.getAttribute('data-col') === id.toString()) {
                    l.classList.add('selected');
                } else {
                    l.classList.remove('selected');
                }
            }
        },
        heatmap_node_tooltip(item: HeatmapTile) {
            return `<div style="text-align:left;">
                        Group: ${item[this.columnKey]}<br />
                        Module: ${item[this.rowKey]}<br />
                        Usage: ${item[this.valueKey].toExponential(3)}
                    </div>`;
        },
    },
    directives: {
        axis(el, binding, vnode) {
            const axis = binding.arg;
            if (axis !== undefined) {
                const axisMethod = { x: 'axisBottom', y: 'axisRight' }[axis];
                const methodArg = binding.value[axis];
                const actualAxis = d3[axisMethod](methodArg);

                // build the axis
                d3.select(el).call(actualAxis);

                // if y-axis, attach "data-syllable" attribute
                if (axis === 'y') {
                    const ticks = d3.selectAll('.y-axis .tick');
                    ticks.attr('data-row', (d: any, i: number) => d);
                } else {
                    const ticks = d3.selectAll('.x-axis .tick');
                    ticks.attr('data-col', (d: any, i: number) => d);
                }

                // if x-axis, check rotation
                if (axis === 'x') {
                    if (vnode && vnode.context && (vnode.context as any).rotate_labels) {
                        el.classList.add('rotate');
                    } else {
                        el.classList.remove('rotate');
                    }
                }
            }
        },
    },
});
</script>

<style scoped>
svg >>> g.rtree path.rlink,
svg >>> g.ctree path.clink {
    fill: none;
    stroke: #aaa;
    stroke-width: 1.5px;
    shape-rendering: geometricPrecision;
}
svg  >>> g.heatmap rect {
    shape-rendering: crispEdges;
}
svg >>> g.x-axis.rotate g.tick text {
    transform: translate(-10px,0px) rotate(-45deg);
    text-anchor: end;
}
svg >>> g.legend path.domain {
    stroke:none;
}
svg >>> g.x-axis text.label,
svg >>> g.y-axis text.label {
    font-family: Verdana,Arial,sans-serif;
    font-size: 13px;
    text-anchor:middle;
    fill:#000;
}
svg >>> g.y-axis g.tick text {
    font-size: 8px;
}
svg >>> g.x-axis g.tick line,
svg >>> g.y-axis g.tick line {
    stroke: #888;
    shape-rendering: crispEdges;
}
svg >>> g.x-axis .domain,
svg >>> g.y-axis .domain {
    stroke: none;
}
svg >>> g.heatmap {
    cursor: crosshair;
}
svg >>> g.y-axis g.tick {
    fill: #888;
}

svg >>> g.y-axis g.tick.selected text,
svg >>> g.x-axis g.tick.selected text {
    font-weight: bold;
    transform: scale(2);
    fill: #000;
    z-index: 1000;
}
svg >>> g.y-axis g.tick.selected line,
svg >>> g.x-axis g.tick.selected line {
    stroke: #000;
    transform: scaleX(3) scaleY(1.5);
}
</style>
