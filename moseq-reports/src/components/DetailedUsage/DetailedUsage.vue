<template>
    <div id="detail-usage-container" style="display: flex; justify-content: space-between;">
        <div id='detail-usage-plot'>
            <svg :width="outsideWidth" :height="outsideHeight" style="border:1px solid black;" >
                <g v-if="show.boxplot" :transform="`translate(${margin.left}, ${margin.top})`">
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
                <g v-if="show.violin" :transform="`translate(${margin.left}, ${margin.top})`">
                    <template v-for="(node, index) in groupedData" v-on:click="select(index, node)">
                        <g class="violin" v-bind:key="index" :transform="`translate(${scale.x(node.group)}, 0)`">
                            <path :d="violinArea(node.kde)" :style="{'fill': color(node.group)}" />
                        </g>
                    </template>
                </g>
                <g v-if="show.points" class="node" :transform="`translate(${margin.left}, ${margin.top})`"> <!-- v-on:click="select(index, node)"   v-bind:style="node.style" v-bind:class="[node.className, {'highlight': node.highlight}]">-->
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
import {area, line} from 'd3-shape'
import {axisBottom, axisLeft} from 'd3-axis';
import {select} from 'd3-selection';
import { schemeSet1 } from 'd3-scale-chromatic';

import DataModel, { EventType } from '../../DataModel';

interface UsageItem{
    usage: number;
    group: string;
    StartTime: string;
}

class UsagePoint{

}

export default Vue.extend({
    name: 'detailed-usage',
    /*components: {
        'heatmap-settings-modal': SettingsModal, 
    },*/
    mounted() {
        this.createView();

        // EventBus.$on('updateHeatmapColorscale', ((event: any) => {
        //     this.updateColorscale(event);
        // }));
        DataModel.subscribe(EventType.GROUPS_CHANGE, this.createView);
        DataModel.subscribe(EventType.SYLLABLE_CHANGE, this.createView);
    },
    data() {
        return {
            individualUseageData: [],
            groupedData: [],
            width: 300,
            height: 200,
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 35
            },
            show:{
                points: true,
                boxplot: true,
                violin: false
            }
        };
    },
    computed: {
        outsideWidth() {
            return this.width + this.margin.left + this.margin.right;
        },
        outsideHeight() {
            return this.height + this.margin.top + this.margin.bottom;
        },
        halfBandwith(){
            return this.scale.x.bandwidth() / 2;
        },
        quaterBandwith(){
            return this.scale.x.bandwidth() / 4;
        },
        origin(){
            const x = this.margin.left;
            const y = this.height + this.margin.top;
            return { x, y };
        },
        scale() {
            if(this.individualUseageData === undefined){
                return {x: scaleBand(), y:scaleLinear()}
            }
            const x = scaleBand()
                .domain(DataModel.getSelectedGroups())
                .rangeRound([0, this.width])
                .padding(0.2);
            const y = scaleLinear()
                .domain([0, Math.max(...this.individualUseageData.map(x => x.usage))])
                .rangeRound([this.height, 0]);
            const kdeMax = Math.max(...this.groupedData.map(g => Math.max(...g.kde.map(k => k[1]))));
            const w = scaleLinear()
                .domain([-kdeMax, kdeMax])
                .range([0, x.bandwidth()])
            return { x, y, w };
        },
        violinArea(){
            const a = area()
                .x0(d => this.scale.w(d[1]))
                .x1(d => this.scale.w(-d[1]))
                .y(d => this.scale.y(d[0]));
            return a;
        },
        violinLine(){
            const a = line()
                .x(d => this.scale.w(d[1]))
                .y(d => this.scale.y(d[0]));
            return a;
        },
        color() {
            return scaleOrdinal(schemeSet1);
        }
    },
    methods: {
        createView() {
            let df = DataModel.getView();
            const currSyllable = DataModel.getSelectedSyllable();

            this.individualUseageData = df.where({'syllable': currSyllable}).select('usage', 'group', 'StartTime').toCollection();
            this.groupedData = DataModel.getSelectedGroups().map(g => {
                let values = df.where({'syllable': currSyllable, 'group': g}).select('usage').sortBy('usage', true).toArray();
                return this.computeGroupStats(values, g);
            });
            //console.log(this.groupedData);
        },
        computeGroupStats(data, group){
            const kde = this.kernelDensityEstimator(this.epanechnikovKernel(.01), this.scale.y.ticks(100));
            return {
                group: group,
                count: data.length,
                min: min(data),
                max: max(data),
                mean: mean(data),
                q1: quantile(data, 0.25),
                q2: quantile(data, 0.5),
                q3: quantile(data, 0.75),
                kde: kde(data)
            };

        },
        kernelDensityEstimator(kernel, x) {
            return function(sample) {
                return x.map(x => [x, mean(sample, function(v:number) { return kernel(x - v); })]);
            };
        },
        epanechnikovKernel(scale) {
            return function(u) {
                return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
            };
        },
    },
    directives: {
        axis(el, binding) {
            const axis = binding.arg;
            const axisMethod = { x: "axisBottom", y: "axisLeft" }[axis];
            const methodArg = binding.value[axis];
            d3.select(el).call(d3[axisMethod](methodArg));
        }
    }
});

</script>



<style scoped lang="scss"></style>