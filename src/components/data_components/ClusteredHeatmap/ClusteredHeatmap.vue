<template>
    <div>
        <svg ref="canvas" :width="outsideWidth" :height="outsideHeight">
            <g class="heatmap" :transform="`translate(${dims.heatmap.x},${dims.heatmap.y})`" v-on:click="setSelectedSyllable">
                <template v-for="(node, index) in usages">
                    <rect 
                        :key="index"
                        :x="scale.x(node.group)"
                        :y="scale.y(node.syllable)"
                        :width="scale.x.bandwidth()"
                        :height="scale.y.bandwidth()"
                        :fill="scale.z(node.usage)"
                        shape-rendering="crispEdges"
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
                <text class="label" :x="-dims.yaxis.h/2" :y="40" transform="rotate(-90)">Module ID</text>
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
import RegisterDataComponent from '@/components/data_components/Core';
import store from '@/store/root.store';
import { Layout } from '@/store/root.types';
import { OrderingType, SortOrderDirection } from './ClusteredHeatmapOptions.vue';
import * as d3 from 'd3';
import { cluster, hierarchy, sum } from 'd3';
import { scaleLinear, scaleBand, scaleSequential } from 'd3-scale';
import { GetScale } from '@/util/D3ColorProvider';
import { getDendrogramOrder, elbowH, elbowV } from '@/util/D3Clustering';
import { spawn, Worker, ModuleThread } from 'threads';
import { ClusterWorker } from './Worker';
import ColorScaleLegend from '@/components/data_components/Core/ColorScaleLegend.vue';





RegisterDataComponent({
    friendly_name: 'Clustered Usage Heatmap',
    component_type: 'clustered-heatmap',
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
    syllable: string;
    usage: number;
}

let worker: ModuleThread<ClusterWorker>;
(async () => {
    worker = await spawn<ClusterWorker>(new Worker('./Worker.ts'));
})();



export default Vue.component('clustered-heatmap', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    components: {
        ColorScaleLegend,
    },
    data() {
        return {
            usages: new Array<HeatmapTile>(),
            clusteredGroupOrder: new Array<string>(),
            groupHierarchy: undefined as any,
            clusteredSyllableOrder: new Array<string>(),
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
                const s = getters.getWindowById(this.id).settings;
                return {
                    syllable_cluster_distance: s.syllable_cluster_distance,
                    syllable_cluster_linkage: s.syllable_cluster_linkage,
                };
            },
            () => this.clusterSyllables(),
        ));
        this.watchers.push(this.$store.watch(
            (state, getters) => {
                const s = getters.getWindowById(this.id).settings;
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
        settings(): any {
            return this.$store.getters.getWindowById(this.id).settings;
        },
        layout(): Layout {
            return this.$store.getters.getWindowById(this.id).layout;
        },
        width(): number {
            return this.outsideWidth - this.margin.left - this.margin.right;
        },
        height(): number {
            return this.outsideHeight - this.margin.top - this.margin.bottom;
        },
        outsideWidth(): number {
            return this.layout.width - 10;
        },
        outsideHeight(): number {
            return this.layout.height - 41;
        },
        dims(): any {
            const rtreeWidth =  this.isSyllablesClustered ? Math.min(this.width * .10, 50) : 0;
            const ctreeHeight = this.isGroupsClustered ? Math.min(this.height * .10, 50) : 0;
            const yaxisWidth = 35;
            let xaxisHeight = 45;
            let xaxisLabelYOffset = 40;
            const legendHeight = 50;

            const heatWidth = this.width - rtreeWidth - yaxisWidth;

            this.rotate_labels = this.label_stats.longest > heatWidth / this.label_stats.count;
            if (this.rotate_labels) {
                const rotatedHeight = Math.cos(45 * (Math.PI / 180)) * this.label_stats.longest;
                xaxisHeight = xaxisLabelYOffset = rotatedHeight + 10;
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
        syllableOrder(): string[] {
            switch (this.settings.syllable_order_type) {
                case OrderingType.Cluster:
                    return this.clusteredSyllableOrder;

                case OrderingType.Value:
                    return this.aggregateView
                                    .where({group: this.settings.syllable_order_group_value})
                                    .sortBy('usage', this.settings.syllable_order_direction === SortOrderDirection.Asc)
                                    .select('syllable')
                                    .toArray()
                                    .flat();

                case OrderingType.Natural:
                default:
                    return this.aggregateView
                                    .select('syllable')
                                    .distinct('syllable')
                                    .sortBy('syllable')
                                    .toArray()
                                    .flat();
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
                .domain(this.syllableOrder)
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
            return this.$store.state.dataview.selectedGroups;
        },
        aggregateView(): any {
            return this.$store.getters['dataview/aggregateView'];
        },
        selectedSyllable: {
            get(): number {
                return this.$store.state.dataview.selectedSyllable;
            },
            set(event: number) {
                this.$store.commit('dataview/setSelectedSyllable', event);
            },
        },
        countMethod(): string {
            return this.$store.state.dataview.countMethod;
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
            this.usages = this.aggregateView.toCollection();

            this.clusterGroups();
            this.clusterSyllables();
            this.compute_label_stats(this.selectedGroups);
        },
        async clusterGroups() {
            const tree = await worker.clusterGroups(this.aggregateView.toDict(),
                this.settings.syllable_cluster_distance,
                this.settings.syllable_cluster_linkage);
            this.clusteredGroupOrder = getDendrogramOrder(tree);
            this.groupHierarchy = hierarchy(tree);
        },
        async clusterSyllables() {
            const tree = await worker.clusterSyllables(this.aggregateView.toDict(),
                this.settings.syllable_cluster_distance,
                this.settings.syllable_cluster_linkage);
            this.clusteredSyllableOrder = getDendrogramOrder(tree);
            this.syllableHierarchy = hierarchy(tree);
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
}
svg >>> g.heatmap {
    cursor: crosshair;
}
svg >>> g.y-axis g.tick {
    fill: #888;
}

svg >>> g.y-axis g.tick.selected text{
    font-weight: bold;
    font-size: 12px;
    fill: #000;
    z-index: 1000;
}
svg >>> g.y-axis g.tick.selected line{
    stroke: #000;
}
</style>
