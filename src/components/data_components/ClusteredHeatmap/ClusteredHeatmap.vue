<template>
    <div>
        <svg ref="canvas" :width="outsideWidth" :height="outsideHeight">
            <g class="heatmap" :transform="`translate(${dims.heatmap.x},${dims.heatmap.y})`" v-on:click="setSelectedSyllable">
                <template v-for="node in usages">
                    <rect 
                        :key="`${node.group}-${node.syllable}`"
                        :x="scale.x(node.group)"
                        :y="scale.y(node.syllable)"
                        :width="scale.x.bandwidth()"
                        :height="scale.y.bandwidth()"
                        :fill="scale.z(node.usage)"
                        :syllable="node.syllable"
                        
                        /><!-- v-b-tooltip.html :title="heatmap_node_tooltip(node)"-->
                </template>
            </g>
            <g class="rtree" v-show="isSyllablesClustered" :transform="`translate(${dims.rtree.x},${dims.rtree.y})`">
                <template v-for="(link, index) in syllableLinks">
                    <path class="rlink" :key="index" :d="elbowH(link)" />
                </template>
            </g>
            <g class="ctree" v-show="isGroupsClustered" text-anchor="middle" :transform="`translate(${dims.ctree.x},${dims.ctree.y})`">
                <template v-for="(link, index) in groupLinks">
                    <path class="clink" :key="index" :d="elbowV(link)" />
                </template>
            </g>
            <g class="x-axis" v-axis:x="scale" :transform="`translate(${dims.xaxis.x},${dims.xaxis.y})`">
                <text class="label" :x="dims.xaxis.w/2" :y="dims.xaxis.ly">Group</text>
            </g>
            <g class="y-axis" v-axis:y="scale" :transform="`translate(${dims.yaxis.x},${dims.yaxis.y})`">
                <text class="label" :x="-dims.yaxis.h/2" :y="50" transform="rotate(-90)">Module ID ({{countMethod}})</text>
            </g>
            <ColorScaleLegend
                :title="`Usage (${countMethod})`"
                :scale="scale.z"
                :width="dims.legend.w"
                :height="10"
                :transform="`translate(${dims.legend.x}, ${dims.legend.y})`" />
        </svg>
    </div>
</template>


<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/Core';
import { OrderingType, SortOrderDirection } from './ClusteredHeatmapOptions.vue';
import * as d3 from 'd3';
import { cluster, hierarchy, sum } from 'd3';
import { scaleBand, scaleSequential } from 'd3-scale';
import { GetScale } from '@/components/Charts/D3ColorProvider';
import { getDendrogramOrder, elbowH, elbowV } from '@/components/Charts/D3Clustering';
import { spawn, Worker, ModuleThread } from 'threads';
import { ClusterWorker } from './Worker';
import ColorScaleLegend from '@/components/Charts/ColorScaleLegend/ColorScaleLegendSVG.vue';
import LoadingMixin from '@/components/Core/LoadingMixin';
import { unnest } from '@/util/Vuex';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';




RegisterDataComponent({
    friendly_name: 'Clustered Usage Heatmap',
    component_type: 'ClusteredHeatmap',
    settings_type: 'ClusteredHeatmapOptions',
    init_width: 400,
    init_height: 500,
    default_settings: {
        syllable_order_type: OrderingType.Cluster,
        syllable_order_group_value: undefined,
        syllable_order_direction: SortOrderDirection.Asc,
        syllable_cluster_distance: 'euclidean',
        syllable_cluster_linkage: 'avg',
        group_order_type: OrderingType.Natural,
        group_cluster_distance: 'euclidean',
        group_cluster_linkage: 'avg',
        colormap: 'interpolateViridis',
    },
});

interface HeatmapTile {
    group: string;
    syllable: number;
    usage: number;
}

let worker: ModuleThread<ClusterWorker>;
(async () => {
    worker = await spawn<ClusterWorker>(new Worker('./Worker.ts'));
})();



export default mixins(LoadingMixin, WindowMixin).extend({
    components: {
        ColorScaleLegend,
    },
    data() {
        return {
            usages: new Array<HeatmapTile>(),
            clusteredGroupOrder: new Array<string>(),
            groupHierarchy: undefined as any,
            clusteredSyllableOrder: new Array<number>(),
            syllableHierarchy: undefined as any,
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
        this.watchers.push(this.$store.watch(
            (state, getters) => {
                const s = unnest(state, this.id).settings;
                return {
                    syllable_cluster_distance: s.syllable_cluster_distance,
                    syllable_cluster_linkage: s.syllable_cluster_linkage,
                };
            },
            () => this.clusterSyllables(),
        ));
        this.watchers.push(this.$store.watch(
            (state, getters) => {
                const s = unnest(state, this.id).settings;
                return {
                    group_cluster_distance: s.group_cluster_distance,
                    group_cluster_linkage: s.group_cluster_linkage,
                };
            },
            () => this.clusterGroups(),
        ));
        this.prepareData();
    },
    destroyed() {
        // un-watch the store
        this.watchers.forEach((w) => w());
    },
    computed: {
        width(): number {
            return this.outsideWidth - this.margin.left - this.margin.right;
        },
        height(): number {
            return this.outsideHeight - this.margin.top - this.margin.bottom;
        },
        outsideWidth(): number {
            return this.layout.width;
        },
        outsideHeight(): number {
            return this.layout.height - 31;
        },
        dims(): any {
            const rtreeWidth =  this.isSyllablesClustered ? Math.min(this.width * .10, 50) : 0;
            const ctreeHeight = this.isGroupsClustered ? Math.min(this.height * .10, 50) : 0;
            const yaxisWidth = 45;
            let xaxisHeight = 45;
            let xaxisLabelYOffset = 40;
            const legendHeight = 50;

            const heatWidth = this.width - rtreeWidth - yaxisWidth;

            this.rotate_labels = this.label_stats.longest > heatWidth / this.label_stats.count;
            if (this.rotate_labels) {
                const rotatedHeight = Math.cos(45 * (Math.PI / 180)) * this.label_stats.longest;
                xaxisHeight = xaxisLabelYOffset = rotatedHeight + 20;
            }

            const heatHeight = this.height - ctreeHeight - xaxisHeight - legendHeight;

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
                y: this.outsideHeight - this.margin.bottom - legendHeight + 10,
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
        groupOrder(): string[] {
            switch (this.settings.group_order_type) {
                case OrderingType.Cluster:
                    return this.clusteredGroupOrder;

                case OrderingType.Natural:
                default:
                    return this.selectedGroups;
            }
        },
        isGroupsClustered(): boolean {
            return this.settings.group_order_type === OrderingType.Cluster;
        },
        isSyllablesClustered(): boolean {
            return this.settings.syllable_order_type === OrderingType.Cluster;
        },
        syllableOrder(): number[] {
            switch (this.settings.syllable_order_type) {
                case OrderingType.Cluster:
                    return this.clusteredSyllableOrder;

                case OrderingType.Value:
                    return this.usages
                               .filter((u) => u.group === this.settings.syllable_order_group_value)
                               .sort((a, b) => a.usage - b.usage)
                               .map((u) => u.syllable);

                case OrderingType.Natural:
                default:
                    return [...new Set(this.usages.map((u) => u.syllable))].sort((a, b) => a - b);
            }
        },
        colormap(): any {
            return GetScale(this.settings.colormap);
        },
        scale(): any {
            const x = scaleBand()
                .domain(this.groupOrder)
                .range([0, this.dims.heatmap.w])
                .padding(0);
            const y = scaleBand()
                .domain(this.syllableOrder.map((s) => s.toString()))
                .range([this.dims.heatmap.h, 0])
                .padding(0);
            const z = scaleSequential(this.colormap)
                .domain([
                    Math.min(...this.usages.map((n) => n.usage)),
                    Math.max(...this.usages.map((n) => n.usage)),
                ]);
            return { x, y, z };
        },
        groupLinks(): any[] {
            if (this.groupHierarchy === undefined) {
                return [];
            }
            return cluster().size([this.dims.ctree.w, this.dims.ctree.h])(this.groupHierarchy as any).links() as any;
        },
        syllableLinks(): any[] {
            if (this.syllableHierarchy === undefined) {
                return [];
            }
            return cluster().size([this.dims.rtree.h, this.dims.rtree.w])(this.syllableHierarchy as any).links() as any;
        },
        selectedGroups(): string[] {
            return this.dataview.selectedGroups;
        },
        aggregateView(): any {
            return this.$store.getters[`${this.datasource}/aggregateView`];
        },
        selectedSyllable: {
            get(): number {
                return this.dataview.selectedSyllable;
            },
            set(event: number) {
                this.$store.commit(`${this.datasource}/setSelectedSyllable`, event);
            },
        },
        countMethod(): string {
            return this.dataview.countMethod;
        },
    },
    watch: {
        aggregateView() {
            this.prepareData();
        },
        selectedSyllable(newValue) {
            this.showSelectedSyllable(newValue);
        },
    },
    methods: {
        elbowH, elbowV,
        prepareData() {
            if (this.aggregateView !== null) {
                this.usages = this.aggregateView.toCollection();

                this.clusterGroups();
                this.clusterSyllables();
                this.compute_label_stats(this.selectedGroups);
            }
        },
        async clusterGroups() {
            if (this.aggregateView !== null) {
                const tree = await worker.clusterGroups(this.aggregateView.toDict(),
                    this.settings.syllable_cluster_distance,
                    this.settings.syllable_cluster_linkage);
                this.clusteredGroupOrder = getDendrogramOrder(tree);
                this.groupHierarchy = hierarchy(tree);
            }
        },
        async clusterSyllables() {
            if (this.aggregateView !== null) {
                const tree = await worker.clusterSyllables(this.aggregateView.toDict(),
                    this.settings.syllable_cluster_distance,
                    this.settings.syllable_cluster_linkage);
                this.clusteredSyllableOrder = getDendrogramOrder(tree);
                this.syllableHierarchy = hierarchy(tree);
            }
        },
        compute_label_stats(labels: string[]) {
            const widths = [] as number[];
            const canvas = this.$refs.canvas as SVGSVGElement;
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
        setSelectedSyllable(event: Event) {
            const sid = (event.target as SVGRectElement).getAttribute('syllable');
            if (sid !== null) {
                this.selectedSyllable = Number.parseInt(sid, 10);
            }
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
                        Group: ${item.group}<br />
                        Module: ${item.syllable}<br />
                        Usage: ${item.usage.toExponential(3)}
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
svg >>> .rlink,
svg >>> .clink {
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
