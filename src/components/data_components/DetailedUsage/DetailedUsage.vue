<template>
    <div id="detail-usage-container" style="display: flex; justify-content: space-between;">
        <div id='detail-usage-plot'>
            <svg ref="canvas" :width="outsideWidth" :height="outsideHeight" >
                <g v-if="settings.show_boxplot" :transform="`translate(${margin.left}, ${margin.top})`">
                    <template v-for="(node, index) in groupedData" v-on:click="select(index, node)">
                        <g class="boxplot" v-bind:key="node.StartTime">
                            <!-- Vertical midline -->
                            <line 
                                stroke="#000000"
                                v-bind:x1="scale.x(node.group) + halfBandwith"
                                v-bind:y1="scale.y(fences.lower(node))"
                                v-bind:x2="scale.x(node.group) + halfBandwith"
                                v-bind:y2="scale.y(fences.upper(node))" />
                            <!-- the Box of the BoxPlot -->
                            <rect 
                                stroke="#000000"
                                v-bind:width="halfBandwith * 2"
                                v-bind:height="scale.y(node.q3) - scale.y(node.q1)"
                                v-bind:x="scale.x(node.group)"
                                v-bind:y="scale.y(node.q1)"
                                v-bind:style="{'fill': color(node.group)}" />
                            <!-- Horizontal Minimum line -->
                            <line 
                                stroke="#000000"
                                v-bind:x1="scale.x(node.group) + quaterBandwith"
                                v-bind:y1="scale.y(fences.lower(node))"
                                v-bind:x2="scale.x(node.group) + (halfBandwith + quaterBandwith)"
                                v-bind:y2="scale.y(fences.lower(node))" />
                            <!-- Horizontal Median line -->
                            <line 
                                stroke="#000000"
                                v-bind:x1="scale.x(node.group)"
                                v-bind:y1="scale.y(node.q2)"
                                v-bind:x2="scale.x(node.group) + (halfBandwith * 2)"
                                v-bind:y2="scale.y(node.q2)" />
                            <!-- Horizontal Maximum line -->
                            <line 
                                stroke="#000000"
                                v-bind:x1="scale.x(node.group) + quaterBandwith"
                                v-bind:y1="scale.y(fences.upper(node))"
                                v-bind:x2="scale.x(node.group) + (halfBandwith + quaterBandwith)"
                                v-bind:y2="scale.y(fences.upper(node))" />
                        </g>
                    </template>
                </g>
                <g v-if="settings.show_violinplot" :transform="`translate(${margin.left}, ${margin.top})`">
                    <template v-for="(node, index) in groupedData" v-on:click="select(index, node)">
                        <g class="violin" v-bind:key="index" :transform="`translate(${scale.x(node.group)}, 0)`">
                            <path :d="violinArea(node.kde)" :style="{'fill': color(node.group)}" />
                        </g>
                    </template>
                </g>
                <g v-if="settings.show_points" class="node" :transform="`translate(${margin.left}, ${margin.top})`">
                    <template v-for="(node, index) in individualUseageData" v-on:click="select(index, node)">
                        <!-- Circles for each node -->
                        <circle
                            v-bind:key="node.StartTime"
                            v-b-tooltip.html :title="point_tooltip(node)"
                            :r="point_size"
                            :cx="scale.x(node.group) + node.jitter + halfBandwith"
                            :cy="scale.y(node.usage)"
                            :style="{'fill': color(node.group), stroke: '#000000'}" />
                    </template>
                </g>
                <g :class="{'x-axis':true, 'rotate': rotate_labels }" v-axis:x="scale" :transform="`translate(${margin.left},${origin.y})`" />
                <g class="y-axis" v-axis:y="scale" :transform="`translate(${margin.left},${margin.top})`" />
                <g>
                    <text transform="rotate(-90)" text-anchor="middle" :y="margin.left / 4" :x="0 - (height/2)">Module Usage</text>
                    <text text-anchor="middle" :y="outsideHeight - (margin.bottom / 4)" :x="margin.left + (width / 2)">Group</text>
                </g>
            </svg>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as d3 from 'd3';
import { scaleLinear, scaleBand, scaleOrdinal } from 'd3-scale';
import { range, histogram, max, min, mean, quantile, median } from 'd3-array';
import { area, line } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { schemeSet1 } from 'd3-scale-chromatic';

import DataModel, { EventType, MetadataJson } from '@/models/DataModel';
import store from '@/store/root.store';
import { Layout } from '@/store/root.types';
import { WhiskerType } from './DetailedUsageOptions.vue';

interface UsageItem {
    usage: number;
    group: string;
    StartTime: string;
    jitter: number;
}

interface UsageItemQueueNode extends UsageItem {
    next: UsageItemQueueNode | null;
}

interface GroupStats {
    group: string;
    count: number;
    min: number;
    max: number;
    mean: number;
    median: number;
    q1: number;
    q2: number;
    q3: number;
    iqr: number;
    kde: number[][];
}

store.commit('registerComponent', {
    friendly_name: 'Usage Details',
    component_type: 'detailed-usage',
    settings_type: 'detailed-usage-options',
    init_width: 400,
    init_height: 500,
    default_settings: {
        show_points: true,
        point_size: 3,
        show_boxplot: true,
        show_violinplot: false,
        boxplot_whiskers: WhiskerType.TUKEY,
    },
});

export default Vue.component('detailed-usage', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            individualUseageData: Array<UsageItem>(),
            groupedData: Array<GroupStats>(),
            margin: {
                top: 20,
                right: 20,
                bottom: 50,
                left: 60,
            },
            groupNames: Array<string>(),
            groupColors: Array<string>(),
            // watchers: Array<(() => void)>(),
            rotate_labels: false,
        };
    },
    mounted() {
        DataModel.subscribe(EventType.GROUPS_CHANGE, this.createView);
        DataModel.subscribe(EventType.SYLLABLE_CHANGE, this.createView);
        DataModel.subscribe(EventType.GROUP_COLORS_CHANGE, this.updateGroupColors);

        this.createView();
    },
    destroyed() {
        // unsubscribe from the data model
        DataModel.unsubscribe(EventType.GROUPS_CHANGE, this.createView);
        DataModel.unsubscribe(EventType.SYLLABLE_CHANGE, this.createView);
        DataModel.unsubscribe(EventType.GROUP_COLORS_CHANGE, this.updateGroupColors);
    },
    computed: {
        settings(): any {
            return this.$store.getters.getWindowById(this.id).settings;
        },
        layout(): Layout {
            return this.$store.getters.getWindowById(this.id).layout;
        },
        width(): number {
            const width = this.outsideWidth - this.margin.left - this.margin.right;
            const ls = this.calc_label_stats();
            this.rotate_labels = ls.longest > width / ls.count;
            if (this.rotate_labels) {
                this.margin.bottom = ls.longest + 30;
            } else {
                this.margin.bottom = 50;
            }
            return width;
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
        halfBandwith(): number {
            return this.scale.x.bandwidth() / 2;
        },
        quaterBandwith(): number {
            return this.scale.x.bandwidth() / 4;
        },
        origin(): any {
            const x = this.margin.left;
            const y = this.height + this.margin.top;
            return { x, y };
        },
        scale(): any {
            if (this.individualUseageData === undefined) {
                return { x: scaleBand(), y: scaleLinear() };
            }
            const x = scaleBand()
                .domain(this.groupNames)
                .rangeRound([0, this.width])
                .padding(0.2);
            const y = scaleLinear()
                .domain([0, Math.max(...this.individualUseageData.map((i) => i.usage))])
                .rangeRound([this.height, 0]);
            const kdeMax = Math.max(...this.groupedData.map((g) => Math.max(...g.kde.map((k) => k[1]))));
            const w = scaleLinear()
                .domain([-kdeMax, kdeMax])
                .range([0, x.bandwidth()]);
            return { x, y, w };
        },
        point_size(): number {
            const ps = this.settings.point_size;
            this.swarm_points(ps);
            return ps;
        },
        fences() {
            switch (this.settings.boxplot_whiskers) {
                case WhiskerType.MIN_MAX:
                    return {
                        lower: (gs: GroupStats) => gs.min,
                        upper: (gs: GroupStats) => gs.max,
                    };
                case WhiskerType.TUKEY:
                    return {
                        lower: (gs: GroupStats) => Math.max(gs.q1 - (1.5 * gs.iqr), gs.min),
                        upper: (gs: GroupStats) => Math.min(gs.q3 + (1.5 * gs.iqr), gs.max),
                    };
                default:
                    throw new Error(`Unsupported Whisker Type ${this.settings.boxplot_whiskers}!`);
            }
        },
        violinArea(): any {
            const a = area()
                .x0((d) => this.scale.w(d[1]))
                .x1((d) => this.scale.w(-d[1]))
                .y((d) => this.scale.y(d[0]));
            return a;
        },
        violinLine(): any {
            const a = line()
                .x((d) => this.scale.w(d[1]))
                .y((d) => this.scale.y(d[0]));
            return a;
        },
        color(): any {
            return scaleOrdinal().domain(this.groupNames).range(this.groupColors);
        },
    },
    methods: {
        createView() {
            if (DataModel.getAvailableGroups().length === 0) {
                return;
            }

            const df = DataModel.getView();
            if (df === null) {
                return;
            }

            this.groupColors = DataModel.getSelectedGroupColors();
            this.groupNames = DataModel.getSelectedGroups();

            const currSyllable = DataModel.getSelectedSyllable();

            this.individualUseageData = df.where({syllable: currSyllable})
                                          .select('usage', 'group', 'StartTime')
                                          .sortBy('usage')
                                          .toCollection();
            this.swarm_points();

            this.groupedData = DataModel.getSelectedGroups().map((g) => {
                const values = df.where({syllable: currSyllable, group: g})
                                 .select('usage')
                                 .sortBy('usage', true)
                                 .toArray();
                return this.computeGroupStats(values, g);
            });
        },
        updateGroupColors(newColors) {
            this.groupColors = newColors;
        },
        computeGroupStats(data: number[], group: string): GroupStats {
            const kde = this.kernelDensityEstimator(this.epanechnikovKernel(.01), this.scale.y.ticks(100));
            const gstats = {
                group,
                count: data.length,
                min: min(data) as number,
                max: max(data) as number,
                mean: mean(data) as number,
                median: median(data) as number,
                q1: quantile(data, 0.25) as number,
                q2: quantile(data, 0.5) as number,
                q3: quantile(data, 0.75) as number,
                kde: kde(data),
            } as GroupStats;
            gstats.iqr = gstats.q1 - gstats.q3;
            return gstats as GroupStats;
        },
        kernelDensityEstimator(kernel: (u: number) => number, x: number[]): (sample: number[]) => number[][] {
            return (sample: number[]) => {
                return x.map((y) => [y, mean(sample, (v: number) => kernel(y - v))]) as number[][];
            };
        },
        epanechnikovKernel(scale: number): (u: number) => number {
            return (u: number) => {
                return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
            };
        },
        point_tooltip(item: UsageItem): string {
            return `<div style="text-align:left;">
                        ${item.group}<br />
                        ${new Date(item.StartTime).toLocaleString('en-US')}<br />
                        ${item.usage}
                    </div>`;
        },
        swarm_points(pointSize?: number) {
            DataModel.getSelectedGroups().map((g) => {
                if (pointSize === undefined) {
                    pointSize = this.settings.point_size as number;
                }
                const radius2 = (pointSize * 2.5) ** 2;
                let head: UsageItemQueueNode | null = null;
                let tail: UsageItemQueueNode | null = null;
                const indv = this.individualUseageData
                               .filter((ui) => ui.group === g)
                               .map((ui) => { ui.jitter = 0; return ui; }) as UsageItemQueueNode[];

                const intersects = (x, y) => {
                    const epsilon = 1e-5;
                    let item = head;
                    while (item) {
                        const dx = (item.jitter - x) ** 2;
                        const dy = (this.scale.y(item.usage) - this.scale.y(y)) ** 2;
                        if (radius2 - epsilon >= dx + dy) {
                            return true;
                        }
                        item = item.next;
                    }
                    return false;
                };

                for (const b of indv) {
                    // Remove circles from the queue that can’t intersect the new circle b.
                    while (head && this.scale.y(head.usage) < (this.scale.y(b.usage) - radius2)) {
                        head = head.next;
                    }
                    // Choose the minimum non-intersecting tangent.
                    b.jitter = 0;
                    if (intersects(b.jitter, b.usage)) {
                        let a = head;
                        b.jitter = Infinity;
                        do {
                            const dy = Math.sqrt(radius2 - (this.scale.y(a!.usage) - this.scale.y(b.usage)) ** 2);
                            const j = a!.jitter + dy;

                            if (j < b.jitter) {
                                if (!intersects(j, b.usage)) {
                                    b.jitter = j;
                                } else if (j < b.jitter && !intersects(-j, b.usage)) {
                                    b.jitter = -j;
                                }
                            }
                            a = a!.next;
                        } while (a);
                        if (b.jitter === Infinity) {
                            // console.log('Got Infinity?', b);
                        }
                    }
                    // Add b to the queue.
                    b.next = null;
                    if (head === null) {
                        head = tail = b;
                    } else {
                        tail = tail!.next = b;
                    }
                }
            });
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



<style>
g.x-axis.rotate g.tick text {
    transform: translate(-10px,0px) rotate(-45deg);
    text-anchor: end;
}
</style>