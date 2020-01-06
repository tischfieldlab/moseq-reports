<template>
    <div>
        <svg :width="outsideWidth" :height="outsideHeight">
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
                        />
                </template>
            </g>
            <g class="rtree" :transform="`translate(${dims.rtree.x},${dims.rtree.y})`">
                <template v-for="(link, index) in syllableLinks">
                    <path class="rlink"
                        :key="index"
                        :d="elbow(link)"
                        />
                </template>
            </g>
            <g class="ctree" text-anchor="middle" :transform="`translate(${dims.ctree.x},${dims.ctree.y})`">
                <template v-for="(link, index) in groupLinks">
                    <path class="clink"
                        :key="index"
                        :d="elbowV(link)"
                        />
                </template>
            </g>
            <g class="x-axis" v-axis:x="scale" :transform="`translate(${dims.xaxis.x},${dims.xaxis.y})`">
                <text class="label" text-anchor="middle" fill="#000" :x="dims.xaxis.w/2" y="40">Group</text>
            </g>
            <g class="y-axis" v-axis:y="scale" :transform="`translate(${dims.yaxis.x},${dims.yaxis.y})`">
                <text transform="rotate(-90)" text-anchor="middle" :x="-dims.yaxis.h/2" :y="-30" fill="#000">Module ID</text>
            </g>
            <g class="legend" :transform="`translate(${dims.legend.x}, ${dims.legend.y})`">
                <defs>
                    <linearGradient id="color_gradiant" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" :stop-color="scale.z(scale.z.domain()[0])" />
                        <stop offset="100%" :stop-color="scale.z(scale.z.domain()[1])" />
                    </linearGradient>
                </defs>
                <rect
                    :x="-dims.legend.w/2"
                    :y="0"
                    :width="dims.legend.w"
                    :height="10"
                    fill="url(#color_gradiant)"
                    />
                <g v-axis:c="scale" transform="translate(0,10)" />
                <text
                    class="title"
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
import { transpose } from '@/Util';
import DataModel, { EventType } from '@/models/DataModel';
import hcluster from 'hclusterjs';
import { scaleLinear, scaleBand, scaleOrdinal, scaleSequential } from 'd3-scale';
import {interpolateViridis} from 'd3-scale-chromatic';
import { Layout } from '@/store/root.types';
import * as d3 from 'd3';
import { cluster, hierarchy, HierarchyNode } from 'd3';

store.commit('registerComponent', {
    friendly_name: 'Clustered Usage Heatmap 2',
    component_type: 'clustered-heatmap2',
    settings_type: 'ClusteredHeatmap2Options',
    init_width: 400,
    init_height: 500,
    default_settings: {
        style: {
            colorscale: 'Portland',
        },
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
            groupOrder: new Array<string>(),
            groupHierarchy: undefined,
            syllableOrder: new Array<string>(),
            syllableHierarchy: undefined,
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
        };
    },
    mounted() {
        this.prepareData();
        DataModel.subscribe(EventType.GROUPS_CHANGE, this.prepareData);
    },
    destroyed() {
        DataModel.unsubscribe(EventType.GROUPS_CHANGE, this.prepareData);
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
            const rtreeWidth =  Math.min(this.width * .10, 50);
            const ctreeHeight = Math.min(this.height * .10, 50);
            const yaxisWidth = 45;
            const xaxisHeight = 45;
            const legendHeight = 50;

            const heatWidth = this.width - rtreeWidth - yaxisWidth;
            const heatHeight = this.height - ctreeHeight - xaxisHeight - legendHeight;
            const heatmap = {
                x: this.margin.left + rtreeWidth + yaxisWidth,
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
                x: heatmap.x,// + (heatWidth / 2),
                y: this.margin.top,
                w: heatWidth,
                h: ctreeHeight,
            };
            const xaxis = {
                x: heatmap.x,
                y: this.margin.top + ctreeHeight + heatHeight,
                w: heatWidth,
                h: xaxisHeight,
            };
            const yaxis = {
                x: heatmap.x,
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
        scale(): any {
            const x = scaleBand()
                .domain(this.groupOrder)
                .range([0, this.dims.heatmap.w])
                .padding(0.01);
            const y = scaleBand()
                .domain(this.syllableOrder)
                .range([this.dims.heatmap.h, 0])
                .padding(-0);
            const z = scaleSequential(interpolateViridis)
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

            [this.groupOrder, this.groupHierarchy] = this.cluster(sylUsage);
            // console.groupLinks(groupOrder);
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

            [this.syllableOrder, this.syllableHierarchy] = this.cluster(sylUsage);
            // console.log(sylOrder);
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
        elbow(d) {
            // console.log(d);
            return `M${d.source.y},${d.source.x}V${d.target.x}H${d.target.y}`;
        },
        elbowV(d) {
            // console.log(d);
            return `M${d.source.x},${d.source.y}H${d.target.x}V${d.target.y}`;
        },
    },
    directives: {
        axis(el, binding) {
            const axis = binding.arg;
            if (axis !== undefined) {
                const axisMethod = { x: 'axisBottom', y: 'axisLeft', c: 'axisBottom' }[axis];
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
