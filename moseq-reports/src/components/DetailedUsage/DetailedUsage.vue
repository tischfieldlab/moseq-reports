<template>
    <div id="detail-usage-container" style="display: flex; justify-content: space-between;">
        <div id='detail-usage-plot'>
            <svg :width="outsideWidth" :height="outsideHeight" style="border:1px solid black;" >
                <g :transform="`translate(${margin.left}, ${margin.top})`">
                    <template v-for="(node, index) in groupedData" v-on:click="select(index, node)">
                        {{node.quartiles}}
                        <g class="boxplot" v-bind:key="node.StartTime">
                            <line 
                                stroke="#000000"
                                v-bind:x1="scale.x(node.group) + halfBandwith"
                                v-bind:y1="scale.y(node.min)"
                                v-bind:x2="scale.x(node.group) + halfBandwith"
                                v-bind:y2="scale.y(node.max)" />
                            <rect 
                                stroke="#000000"
                                v-bind:width="halfBandwith * 2"
                                v-bind:height="scale.y(node.q3) - scale.y(node.q1)"
                                v-bind:x="scale.x(node.group)"
                                v-bind:y="scale.y(node.q1)"
                                v-bind:style="{'fill': color(node.group)}"
                            />
                            <line 
                                stroke="#000000"
                                v-bind:x1="scale.x(node.group)"
                                v-bind:y1="scale.y(node.min)"
                                v-bind:x2="scale.x(node.group) + (halfBandwith * 2)"
                                v-bind:y2="scale.y(node.min)" />
                            <line 
                                stroke="#000000"
                                v-bind:x1="scale.x(node.group)"
                                v-bind:y1="scale.y(node.q2)"
                                v-bind:x2="scale.x(node.group) + (halfBandwith * 2)"
                                v-bind:y2="scale.y(node.q2)" />
                            <line 
                                stroke="#000000"
                                v-bind:x1="scale.x(node.group)"
                                v-bind:y1="scale.y(node.max)"
                                v-bind:x2="scale.x(node.group) + (halfBandwith * 2)"
                                v-bind:y2="scale.y(node.max)" />
                        </g>
                    </template>
                </g>
                <g class="node" :transform="`translate(${margin.left}, ${margin.top})`"> <!-- v-on:click="select(index, node)"   v-bind:style="node.style" v-bind:class="[node.className, {'highlight': node.highlight}]">-->
                    <template v-for="(node, index) in individualUseageData" v-on:click="select(index, node)">
                        <!-- Circles for each node -->  
                        <circle 
                            v-bind:key="node.StartTime"
                            :r="3" 
                            v-bind:cx="scale.x(node.group) + halfBandwith + (Math.random() * (quaterBandwith - (-quaterBandwith)) + (-quaterBandwith))"
                            v-bind:cy="scale.y(node.usage)" 
                            v-bind:style="{'fill': color(node.group), stroke: '#000000'}" />
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
import {range, histogram, max, min, quantile} from 'd3-array';
import {axisBottom, axisLeft} from 'd3-axis';
import {path} from 'd3-path';
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
                .padding(0.15);
            const y = scaleLinear()
                .domain([0, Math.max(...this.individualUseageData.map(x => x.usage))])
                .rangeRound([this.height, 0]);
            return { x, y };
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
            //this.$forceUpdate();
        },
        computeGroupStats(data, group){
            return {
                group: group,
                count: data.length,
                min: min(data),
                max: max(data),
                q1: quantile(data, 0.25),
                q2: quantile(data, 0.5),
                q3: quantile(data, 0.75)
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