<template>
    <div>
        <template v-if="has_data">
            <svg :width="outsideWidth" :height="outsideHeight">
                <text class="title" :x="this.outsideWidth / 2" :y="20">
                    Module #{{ selectedSyllable }} ({{countMethod}}) Spinogram
                </text>
                <g :transform="`translate(${margin.left}, ${margin.top})`">
                    <template v-for="(tp, idx) in spinogram_plot">
                        <path 
                            v-bind:key="idx"
                            :d="line(tp)"
                            :stroke="line_color"
                            :stroke-width="line_weight"
                            :style="{opacity:spinogram_alphas[idx]}" />
                    </template>
                </g>
                <g class="x-axis" v-axis:x="scale" :transform="`translate(${margin.left},${origin.y})`">
                    <text class="label" :x="this.width / 2" :y="40">
                        Relative Lateral Position (mm)
                    </text>
                </g>
                <g class="y-axis" v-axis:y="scale" :transform="`translate(${margin.left},${margin.top})`">
                    <text class="label"
                        transform="rotate(-90)"
                        :y="-45"
                        :x="0 - (height / 2)"
                        dy="1em">
                        Height (mm)
                    </text>
                </g>
            </svg>
        </template>
        <p v-else>No Data</p>
    </div>
</template>


<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/data_components/Core';

import {Layout, getNested} from '@/store/root.types';
import * as d3 from 'd3';
import {line} from 'd3-shape';
import {scaleLinear} from 'd3-scale';
import { CountMethod } from '../../../store/dataview.store';

interface Spinogram {
    id: number;
    data: SpinogramTimepoint[];
}

interface SpinogramTimepoint {
    x: number[];
    y: number[];
    a: number;
}

RegisterDataComponent({
    friendly_name: 'Spinogram',
    component_type: 'spinogram-plots',
    settings_type: 'spinogram-options',
    init_width: 400,
    init_height: 200,
    default_settings: {
        line_color: '#FF0000',
        line_weight: 2,
    },
});


export default Vue.component('spinogram-plots', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            margin: {
                top: 30,
                right: 20,
                bottom: 45,
                left: 45,
            },
        };
    },
    computed: {
        datasource(): string {
            return this.$store.getters.getWindowById(this.id).source.name;
        },
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
            return this.layout.width;
        },
        outsideHeight(): number {
            return this.layout.height - 31;
        },
        origin(): any {
            const x = this.margin.left;
            const y = this.height + this.margin.top;
            return { x, y };
        },
        scale(): any {
            if (this.spinogram_plot === undefined) {
                return { x: scaleLinear(), y: scaleLinear() };
            }
            const x = scaleLinear()
                .domain([0, 200])
                .rangeRound([0, this.width]);
            const y = scaleLinear()
                .domain([0, 100])
                .rangeRound([this.height, 0]);
            return { x, y };
        },
        line(): any {
            const a = line()
                .x((d) => this.scale.x(d[0]))
                .y((d) => this.scale.y(d[1]));
            return a;
        },
        line_color(): string {
            return this.settings.line_color;
        },
        line_weight(): string {
            return this.settings.line_weight;
        },
        selectedSyllable(): number {
            return getNested(this.$store.state, this.datasource).selectedSyllable;
        },
        usageSelectedSyllable(): number {
            return this.$store.getters[`${this.datasource}/selectedSyllableAs`](CountMethod.Usage);
        },
        countMethod(): string {
            return getNested(this.$store.state, this.datasource).countMethod;
        },
        spinogram_data(): Spinogram {
            return this.$store.state.datasets.spinogram.find((s) => s.id === this.usageSelectedSyllable) as Spinogram;
        },
        spinogram_plot(): number[][][] {
            return this.spinogram_data.data.map((stp, idx) => {
                return stp.x.map((tpx, jdx) => [ tpx, stp.y[jdx] ]);
            });
        },
        spinogram_alphas(): number[] {
            return this.spinogram_data.data.map((stp, idx) => stp.a);
        },
        has_data(): boolean {
            return this.spinogram_data !== undefined;
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

<style scoped>
path {
    fill:none;
}
svg >>> g.x-axis text.label,
svg >>> g.y-axis text.label,
svg >>> text.title {
    text-anchor:middle;
    fill:#000;
    font-family: Verdana,Arial,sans-serif;
    font-size: 13px;
}

</style>