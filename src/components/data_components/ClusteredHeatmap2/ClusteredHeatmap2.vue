<template>
    <div>
        <svg ref="canvas" :width="outsideWidth" :height="outsideHeight">
            <g class="heatmap" :transform="`translate(${dims.heatmap.x},${dims.heatmap.y})`">
                <template v-for="(node, index) in usages">
                    <rect 
                        :key="index"
                        :x="scale.x(node.group)"
                        :y="scale.y(node.syllable)"
                        :width="scale.x.bandwidth()"
                        :height="scale.y.bandwidth()"
                        :fill="scale.z(node.usage)"
                        shape-rendering="crispEdges"
                        :mouseover="hover_syllable = node.syllable"
                        v-on:click="setSelectedSyllable(node.syllable)"
                        v-b-tooltip.html :title="heatmap_node_tooltip(node)"
                        />
                </template>
            </g>
            <g class="rtree" v-show="isSyllablesClustered" :transform="`translate(${dims.rtree.x},${dims.rtree.y})`">
                <template v-for="(link, index) in syllableLinks">
                    <path class="rlink"
                        :key="index"
                        :d="elbowH(link)"
                        />
                </template>
            </g>
            <g class="ctree" v-show="isGroupsClustered" text-anchor="middle" :transform="`translate(${dims.ctree.x},${dims.ctree.y})`">
                <template v-for="(link, index) in groupLinks">
                    <path class="clink"
                        :key="index"
                        :d="elbowV(link)"
                        />
                </template>
            </g>
            <g :class="{'x-axis':true, 'rotate':rotate_labels}" v-axis:x="scale" :transform="`translate(${dims.xaxis.x},${dims.xaxis.y})`">
                <text class="label" text-anchor="middle" fill="#000" :x="dims.xaxis.w/2" :y="dims.xaxis.ly">Group</text>
            </g>
            <g class="y-axis" v-axis:y="scale" :transform="`translate(${dims.yaxis.x},${dims.yaxis.y})`">
                <text class="label" transform="rotate(-90)" text-anchor="middle" :x="-dims.yaxis.h/2" :y="40" fill="#000">Module ID</text>
            </g>
            <g class="legend" :transform="`translate(${dims.legend.x}, ${dims.legend.y})`">
                <defs>
                    <linearGradient :id="`color_gradiant_${id}`" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" :stop-color="scale.z(scale.z.domain()[0])" />
                        <stop offset="100%" :stop-color="scale.z(scale.z.domain()[1])" />
                    </linearGradient>
                </defs>
                <rect
                    :x="-dims.legend.w/2"
                    :y="0"
                    :width="dims.legend.w"
                    :height="10"
                    :fill="`url(#color_gradiant_${id})`"
                    />
                <g v-axis:c="scale" transform="translate(0,10)" />
                <text
                    class="label"
                    x="0"
                    y="50"
                    style="text-anchor:middle;">
                    Usage
                </text>
            </g>
        </svg>
    </div>
</template>


<script lang="ts">
import Vue from 'vue';
import store from '@/store/root.store';
import DataModel, { EventType } from '@/models/DataModel';
import hcluster from 'hclusterjs';
import { scaleLinear, scaleBand, scaleOrdinal, scaleSequential } from 'd3-scale';
import {interpolateViridis} from 'd3-scale-chromatic';
import { Layout } from '@/store/root.types';
import * as d3 from 'd3';
import { cluster, hierarchy, HierarchyNode } from 'd3';
import {OrderingType, SortOrderDirection} from '@/components/data_components/ClusteredHeatmap2/ClusteredHeatmap2Options.vue';
import {GetScale} from '@/util/D3ColorProvider';

store.commit('registerComponent', {
    friendly_name: 'Clustered Usage Heatmap 2',
    component_type: 'clustered-heatmap2',
    settings_type: 'ClusteredHeatmap2Options',
    init_width: 400,
    init_height: 500,
    default_settings: {
        syllable_order_type: OrderingType.Natural,
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

interface SyllableRow {
    name: string;
    usage: number[];
}
interface HeatmapTile {
    group: string;
    syllable: string;
    usage: number;
}

export default Vue.component('clustered-heatmap2', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            usages: new Array<HeatmapTile>(),
            clusteredGroupOrder: new Array<string>(),
            groupHierarchy: undefined,
            clusteredSyllableOrder: new Array<string>(),
            syllableHierarchy: undefined,
            rotate_labels: false,
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
            label_stats: {count: 0, total: 0, longest: 0},
            hover_syllable: -1,
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
            (newValue, oldValue) => {
                this.clusterSyllables();
            },
        ));
        this.watchers.push(this.$store.watch(
            (state, getters) => {
                const s = getters.getWindowById(this.id).settings;
                return {
                    group_cluster_distance: s.group_cluster_distance,
                    group_cluster_linkage: s.group_cluster_linkage,
                };
            },
            (newValue, oldValue) => {
                this.clusterGroups();
            },
        ));
        this.prepareData();
        DataModel.subscribe(EventType.GROUPS_CHANGE, this.prepareData);
    },
    destroyed() {
        // un-watch the store
        this.watchers.forEach((w) => w());
        // unsubscribe from the data model
        DataModel.unsubscribe(EventType.GROUPS_CHANGE, this.prepareData);
    },
    updated() {
        const s = this.calc_label_stats();
        if (s.longest !== this.label_stats.longest) {
            this.label_stats = s;
        }
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
                xaxisHeight = this.label_stats.longest + 10;
                xaxisLabelYOffset = this.label_stats.longest + 10;
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
                x: heatmap.x, // + (heatWidth / 2),
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
                    return DataModel.getSelectedGroups();
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
                    return DataModel.getAggregateView()
                                    .where({group: this.settings.syllable_order_group_value})
                                    .sortBy('usage', this.settings.syllable_order_direction === SortOrderDirection.Asc)
                                    .select('syllable')
                                    .toArray()
                                    .flat();

                case OrderingType.Natural:
                default:
                    return DataModel.getAggregateView()
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
            const c = scaleLinear()
                .domain(z.domain())
                .range([-this.dims.legend.w / 2, this.dims.legend.w / 2]);
            return { x, y, z, c };
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
    },
    methods: {
        prepareData() {
            const groups = DataModel.getSelectedGroups();
            this.usages = DataModel.getAggregateView().toCollection();

            this.clusterGroups();
            this.clusterSyllables();
        },
        clusterGroups() {
            const groups = DataModel.getSelectedGroups();
            const df = DataModel.getAggregateView();

            const sylUsage = new Array<SyllableRow>();
            for (const g of groups) {
                sylUsage.push({
                    name: g,
                    usage: df.where({group: g}).select('usage').toArray().flat() as [],
                });
            }

            [this.clusteredGroupOrder, this.groupHierarchy] = this.cluster(sylUsage,
                                                                           this.settings.group_cluster_distance,
                                                                           this.settings.group_cluster_linkage);
        },
        clusterSyllables() {
            const df = DataModel.getAggregateView();
            const syllableIds = df.select('syllable').distinct('syllable').toArray().flat();

            const sylUsage = new Array<SyllableRow>();
            for (const sid of syllableIds) {
                sylUsage.push({
                    name: sid,
                    usage: df.where({syllable: sid}).select('usage').toArray().flat() as [],
                });
            }

            [this.clusteredSyllableOrder, this.syllableHierarchy] = this.cluster(sylUsage,
                                                                            this.settings.syllable_cluster_distance,
                                                                            this.settings.syllable_cluster_linkage);
        },
        cluster(data: any[], distance = 'euclidean', linkage = 'avg', key = 'usage') {
            const clustering = hcluster()
                .distance(distance) // support for 'euclidean' and 'angular'
                .linkage(linkage)   // support for 'avg', 'max' and 'min'
                .posKey(key)        // object key holding value
                .data(data);        // pass in an array of objects

            const tree = clustering.tree();
            return [
                this.getDenOrder(tree),
                hierarchy(tree),
            ];
        },
        getDenOrder(tree) {
            return this.getDenRec(tree, []);
        },
        getDenRec(tree, denOrder) {
            if (typeof tree.children === 'undefined') {
                denOrder[denOrder.length] = tree.name;
                return denOrder;
            }
            denOrder = this.getDenRec(tree.children[0], denOrder);
            denOrder = this.getDenRec(tree.children[1], denOrder);
            return denOrder;
        },
        elbowH(d) {
            return `M${d.source.y},${d.source.x}V${d.target.x}H${d.target.y}`;
        },
        elbowV(d) {
            return `M${d.source.x},${d.source.y}H${d.target.x}V${d.target.y}`;
        },
        calc_label_stats() {
            try {
                const canvas = this.$refs.canvas as ParentNode;
                const labels = [...canvas.querySelectorAll('g.x-axis g.tick text')] as SVGTextElement[];
                const totalWidth = labels.reduce((total: number, e: SVGTextElement) =>  total + e.getBBox().width, 0);
                return {
                    count: labels.length,
                    total: totalWidth,
                    longest: Math.max(...labels.map((e) => e.getBBox().width)),
                };
            } catch (e) {
                return {count: 0, total: 0, longest: 0};
            }
            return {count: 0, total: 0, longest: 0};
        },
        setSelectedSyllable(syllableId: number) {
            DataModel.updateSelectedSyllable(syllableId);
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
        axis(el, binding) {
            const axis = binding.arg;
            if (axis !== undefined) {
                const axisMethod = { x: 'axisBottom', y: 'axisRight', c: 'axisBottom' }[axis];
                const methodArg = binding.value[axis];
                const actualAxis = d3[axisMethod](methodArg);
                if (axis === 'c') {
                    actualAxis.ticks(5);
                }
                d3.select(el).call(actualAxis);
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
svg >>> path.domain {
    stroke:none;
}
svg >>> g.x-axis text.label,
svg >>> g.y-axis text.label,
svg >>> g.legend text.label {
    font-family: Verdana,Arial,sans-serif;
    font-size: 13px;
}
svg >>> g.y-axis g.tick text {
    font-size: 8px;
}
svg >>> g.x-axis g.tick line,
svg >>> g.y-axis g.tick line,
svg >>> g.legend g.tick line {
    stroke: #666;
}
svg >>> g.heatmap {
    cursor: crosshair;
}
svg >>> g.legend g.tick text,
svg >>> g.legend text.label {
    fill: #666;
}
</style>
