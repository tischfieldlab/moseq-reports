<template>
    <svg ref="canvas" :width="width" :height="height">
        <g class="heatmap" :transform="`translate(${dims.heatmap.x},${dims.heatmap.y})`">
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
import { OrderingType, SortOrderDirection, HeatmapTile } from './ClusterHeatmap.types';
import * as d3 from 'd3';
import { cluster, hierarchy, sum, extent } from 'd3';
import { scaleBand, scaleSequential } from 'd3-scale';
import { GetScale } from '@/components/Charts/D3ColorProvider';
import { getDendrogramOrder, elbowH, elbowV } from '@/components/Charts/D3Clustering';
import { spawn, Worker, ModuleThread, Thread } from 'threads';
import { ClusterWorker } from './Worker';
import ColorScaleLegend from '@/components/Charts/ColorScaleLegend/ColorScaleLegendSVG.vue';
import LoadingMixin from '@/components/Core/LoadingMixin';
import { unnest } from '@/util/Vuex';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';


if (module.hot) {
    module.hot?.addDisposeHandler(async () => await Thread.terminate(worker));
}
let worker: ModuleThread<ClusterWorker>;
(async () => {
    worker = await spawn<ClusterWorker>(new Worker('./Worker.ts'));
})();



export default Vue.extend({
    components: {
        ColorScaleLegend,
    },
    props: {
        data: {
            required: true,
            type: Array,
        },
        width: {
            required: true,
            type: Number,
        },
        height: {
            required: true,
            type: Number,
        },
        colorscale: {
            type: String,
            default: 'interpolateViridis',
        },
        columnKey: {
            required: true,
            type: String,
        },
        rowKey: {
            required: true,
            type: String,
        },
        valueKey: {
            required: true,
            type: String,
        },
        columnOrderType: {
            type: String,
            default: OrderingType.Cluster,
        },
        columnClusterDistance: {
            type: String,
            default: 'euclidean',
        },
        columnClusterLinkage: {
            type: String,
            default: 'avg',
        },
        columnOrderValue: {
            type: String,
        },
        rowOrderType: {
            type: String,
            default: OrderingType.Cluster,
        },
        rowClusterDistance: {
            type: String,
            default: 'euclidean',
        },
        rowClusterLinkage: {
            type: String,
            default: 'avg',
        },
        rowOrderValue: {
            type: String,
        },
        rowOrderDirection: {
            type: String,
            default: SortOrderDirection.Asc,
        },
        groupLabels: {
            required: true,
            type: Array, /* Array<string> */
            default: () => new Array<string>(),
        },
        xAxisTitle: {
            type: String,
            default: 'Group',
        },
        yAxisTitle: {
            type: String,
            default: 'Value',
        },
        legendTitle: {
            type: String,
            default: 'Value',
        },
    },
    watch: {
        data: {
            async handler(newData) {
                this.prep_data();
            },
            immediate: true,
        },
        selectedSyllable(newValue) {
            this.showSelectedSyllable(newValue);
        },
    },
    data() {
        return {
            clusteredColumnOrder: new Array<string>(),
            columnHierarchy: undefined as any,
            clusteredRowOrder: new Array<number>(),
            rowHierarchy: undefined as any,
            rotate_labels: false,
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
            label_stats: {count: 0, total: 0, longest: 0},
            watchers: Array<(() => void)>(),
        };
    },
    mounted() {
        this.prep_data();
    },
    destroyed() {
        // un-watch the store
        this.watchers.forEach((w) => w());
    },
    computed: {
        innerWidth(): number {
            return this.width - this.margin.left - this.margin.right;
        },
        innerHeight(): number {
            return this.height - this.margin.top - this.margin.bottom;
        },
        dims(): any {
            const rtreeWidth =  this.isRowsClustered ? Math.min(this.innerWidth * .10, 50) : 0;
            const ctreeHeight = this.isColumnsClustered ? Math.min(this.innerHeight * .10, 50) : 0;
            const yaxisWidth = 45;
            let xaxisHeight = 45;
            let xaxisLabelYOffset = 40;
            const legendHeight = 50;

            const heatWidth = this.innerWidth - rtreeWidth - yaxisWidth;

            this.rotate_labels = this.label_stats.longest > heatWidth / this.label_stats.count;
            if (this.rotate_labels) {
                const rotatedHeight = Math.cos(45 * (Math.PI / 180)) * this.label_stats.longest;
                xaxisHeight = xaxisLabelYOffset = rotatedHeight + 20;
            }

            const heatHeight = this.innerHeight - ctreeHeight - xaxisHeight - legendHeight;

            const heatmap = {
                x: this.margin.left + rtreeWidth,
                y: this.margin.top + ctreeHeight,
                w: heatWidth,
                h: heatHeight,
            };
            const rtree = {
                x: this.margin.left,
                y: this.margin.top + ctreeHeight,
                w: rtreeWidth,
                h: heatHeight,
            };
            const ctree = {
                x: heatmap.x,
                y: this.margin.top,
                w: heatWidth,
                h: ctreeHeight,
            };
            const xaxis = {
                x: heatmap.x,
                y: this.margin.top + ctreeHeight + heatHeight,
                w: heatWidth,
                h: xaxisHeight,
                ly: xaxisLabelYOffset,
            };
            const yaxis = {
                x: heatmap.x + heatWidth,
                y: heatmap.y,
                w: yaxisWidth,
                h: heatHeight,
            };
            const legend = {
                x: heatmap.x + (heatmap.w / 2),
                y: this.height - this.margin.bottom - legendHeight + 10,
                w: Math.min(heatmap.w, 400),
                h: legendHeight,
            };
            return {
                heatmap,
                xaxis, yaxis,
                rtree, ctree,
                legend,
            };
        },
        columnOrder(): string[] {
            switch (this.columnOrderType) {
                case OrderingType.Cluster:
                    return this.clusteredColumnOrder;

                case OrderingType.Natural:
                default:
                    return this.groupLabels as string[];
            }
        },
        isColumnsClustered(): boolean {
            return this.columnOrderType === OrderingType.Cluster;
        },
        isRowsClustered(): boolean {
            return this.rowOrderType === OrderingType.Cluster;
        },
        rowOrder(): number[] {
            switch (this.rowOrderType) {
                case OrderingType.Cluster:
                    return this.clusteredRowOrder;

                case OrderingType.Value:
                    return (this.data as HeatmapTile[])
                               .filter((u) => u[this.columnKey] === this.rowOrderValue)
                               .sort((a, b) => {
                                   if (this.rowOrderDirection === SortOrderDirection.Asc) {
                                       return b[this.valueKey] - a[this.valueKey];
                                   } else {
                                       return a[this.valueKey] - b[this.valueKey];
                                   }
                               })
                               .map((u) => u[this.rowKey]);

                case OrderingType.Natural:
                default:
                    return [...new Set((this.data as HeatmapTile[]).map((u) => u[this.rowKey]))].sort((a, b) => a - b);
            }
        },
        colormap(): any {
            return GetScale(this.colorscale);
        },
        scale(): any {
            const x = scaleBand()
                .domain(this.columnOrder)
                .range([0, this.dims.heatmap.w])
                .padding(0);
            const y = scaleBand()
                .domain(this.rowOrder.map((s) => s.toString()))
                .range([this.dims.heatmap.h, 0])
                .padding(0);
            const z = scaleSequential(this.colormap)
                .domain(extent((this.data as HeatmapTile[]).map((n) => n[this.valueKey])) as [number, number]);

            return { x, y, z };
        },
        columnLinks(): any[] {
            if (this.columnHierarchy === undefined) {
                return [];
            }
            return cluster().size([this.dims.ctree.w, this.dims.ctree.h])(this.columnHierarchy as any).links() as any;
        },
        rowLinks(): any[] {
            if (this.rowHierarchy === undefined) {
                return [];
            }
            return cluster().size([this.dims.rtree.h, this.dims.rtree.w])(this.rowHierarchy as any).links() as any;
        },
    },
    methods: {
        prep_data() {
            if (this.data !== null) {
                this.clusterColumns();
                this.clusterRows();
                this.compute_label_stats(this.groupLabels as string[]);
            }
        },
        elbowH, elbowV,
        async clusterColumns() {
            if (this.data !== null && this.data.length > 0) {
                const tree = await worker.clusterColumns(this.data, this.columnKey, this.valueKey,
                    this.columnClusterDistance,
                    this.columnClusterLinkage);
                this.clusteredColumnOrder = getDendrogramOrder(tree);
                this.columnHierarchy = hierarchy(tree);
            }
        },
        async clusterRows() {
            if (this.data !== null && this.data.length > 0) {
                const tree = await worker.clusterRows(this.data, this.rowKey, this.valueKey,
                    this.rowClusterDistance,
                    this.rowClusterLinkage);
                this.clusteredRowOrder = getDendrogramOrder(tree);
                this.rowHierarchy = hierarchy(tree);
            }
        },
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
        showSelectedSyllable(id: number) {
            const canvas = this.$refs.canvas as ParentNode;
            const labels = [...canvas.querySelectorAll('g.y-axis .tick')] as SVGTextElement[];
            for (const l of labels) {
                if (l.getAttribute('data-syllable') === id.toString()) {
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
                    ticks.attr('data-syllable', (d: any, i: number) => d);
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

svg >>> g.y-axis g.tick.selected text{
    font-weight: bold;
    transform: scale(2);
    fill: #000;
    z-index: 1000;
}
svg >>> g.y-axis g.tick.selected line{
    stroke: #000;
    transform: scaleX(3) scaleY(1.5);
}
</style>
