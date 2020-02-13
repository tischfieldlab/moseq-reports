<template>
    <div id="detail-usage-container" style="display: flex; justify-content: space-between;">
        <div id='detail-usage-plot'>
            <svg :width="outsideWidth" :height="outsideHeight" >
                <g v-if="settings.show_boxplot" :transform="`translate(${margin.left}, ${margin.top})`">
                    <template v-for="(node, index) in groupedData" v-on:click="select(index, node)">
                        <g class="boxplot" v-bind:key="node.StartTime">
                            <!-- Vertical midline -->
                            <line 
                                stroke="#000000"
                                v-bind:x1="scale.x(node.group) + halfBandwith"
                                v-bind:y1="scale.y(node.min)"
                                v-bind:x2="scale.x(node.group) + halfBandwith"
                                v-bind:y2="scale.y(node.max)" />
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
                                v-bind:y1="scale.y(node.min)"
                                v-bind:x2="scale.x(node.group) + (halfBandwith + quaterBandwith)"
                                v-bind:y2="scale.y(node.min)" />
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
                                v-bind:y1="scale.y(node.max)"
                                v-bind:x2="scale.x(node.group) + (halfBandwith + quaterBandwith)"
                                v-bind:y2="scale.y(node.max)" />
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
                <g v-if="settings.show_points" class="node" :transform="`translate(${margin.left}, ${margin.top})`"> <!-- v-on:click="select(index, node)"   v-bind:style="node.style" v-bind:class="[node.className, {'highlight': node.highlight}]">-->
                    <template v-for="(node, index) in individualUseageData" v-on:click="select(index, node)">
                        <!-- Circles for each node -->  
                        <circle 
                            v-bind:key="node.StartTime"
                            :r="3" 
                            :cx="scale.x(node.group) + halfBandwith + (Math.random() * (quaterBandwith - (-quaterBandwith)) + (-quaterBandwith))"
                            :cy="scale.y(node.usage)" 
                            :style="{'fill': color(node.group), stroke: '#000000'}" />
                    </template>
                </g>
                <g v-axis:x="scale" :transform="`translate(${margin.left},${origin.y})`" />
                <g v-axis:y="scale" :transform="`translate(${margin.left},${margin.top})`" />
            </svg>
        </div>

        <!--<div id="heatmap-settings">
            <input type="image" name="heatmap-wheel" @click="showSettingsModal = true"
                src="https://static.thenounproject.com/png/333746-200.png">
            <heatmap-settings-modal v-if="showSettingsModal" @close="showSettingsModal = false"></heatmap-settings-modal>     
        </div>-->
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as d3 from 'd3';
import {scaleLinear, scaleBand, scaleOrdinal} from 'd3-scale';
import {range, histogram, max, min, mean, quantile} from 'd3-array';
import {area, line} from 'd3-shape';
import {axisBottom, axisLeft} from 'd3-axis';
import {select} from 'd3-selection';
import { schemeSet1 } from 'd3-scale-chromatic';

import DataModel, { EventType, MetadataJson } from '@/models/DataModel';
import store from '@/store/root.store';
import {Layout} from '@/store/root.types';

interface UsageItem {
    usage: number;
    group: string;
    StartTime: string;
}

interface GroupStats {
    group: string;
    count: number;
    min: number;
    max: number;
    mean: number;
    q1: number;
    q2: number;
    q3: number;
    kde: number[];
}

store.commit('registerComponent', {
    friendly_name: 'Usage Details',
    component_type: 'detailed-usage',
    settings_type: 'detailed-usage-options',
    init_width: 400,
    init_height: 500,
    default_settings: {
        show_points: true,
        show_boxplot: true,
        show_violinplot: false,
        /* style: {
            colorscale: 'Portland',
        }, */
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
                bottom: 20,
                left: 35,
            },
            groupNames: Array<string>(),
            groupColors: Array<string>(),
            // watchers: Array<(() => void)>(),
        };
    },
    mounted() {
        DataModel.subscribe(EventType.GROUPS_CHANGE, this.createView);
        DataModel.subscribe(EventType.SYLLABLE_CHANGE, this.createView);
        DataModel.subscribe(EventType.GROUP_COLORS_CHANGE, this.updateGroupColors);

        this.createView();
    },
    destroyed() {
        // un-watch the store
        // this.watchers.forEach((w) => w());
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
                                          .toCollection();

            this.groupedData = DataModel.getSelectedGroups().map((g) => {
                const values = df.where({syllable: currSyllable, group: g})
                                 .select('usage')
                                 .sortBy('usage', true)
                                 .toArray();
                return this.computeGroupStats(values, g);
            });
            // console.log(this.groupedData);
        },
        updateGroupColors(newColors) {
            this.groupColors = newColors;
        },
        computeGroupStats(data, group): GroupStats {
            const kde = this.kernelDensityEstimator(this.epanechnikovKernel(.01), this.scale.y.ticks(100));
            return {
                group,
                count: data.length,
                min: min(data) as any,
                max: max(data) as any,
                mean: mean(data) as any,
                q1: quantile(data, 0.25) as any,
                q2: quantile(data, 0.5) as any,
                q3: quantile(data, 0.75) as any,
                kde: kde(data),
            };

        },
        kernelDensityEstimator(kernel, x) {
            return (sample) => {
                return x.map((y) => [y, mean(sample, (v: number) => kernel(y - v))]);
            };
        },
        epanechnikovKernel(scale) {
            return (u) => {
                return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
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



<style scoped lang="scss">
</style>