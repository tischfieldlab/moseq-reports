<template>
    <div>
        <template v-if="has_data">
            <svg :width="outsideWidth" :height="outsideHeight" >
                <g :transform="`translate(${margin.left}, ${margin.top})`" >
                    <template v-for="(tp, idx) in current_data">
                        <path v-bind:key="idx" :d="line(tp)" :style="{opacity:current_alphas[idx]}" />
                    </template>
                </g>
                <g v-axis:x="scale" :transform="`translate(${margin.left},${origin.y})`" />
                <g v-axis:y="scale" :transform="`translate(${margin.left},${margin.top})`" />
                <text 
                    transform="rotate(-90)"
                    :y="0"
                    :x="0 - (height / 2)"
                    dy="1em"
                    style="text-anchor:middle;">
                    Height (mm)
                </text>
                <text
                    style="text-anchor:middle;"
                    :transform="`translate(${xLabelPos[0]},${xLabelPos[1]})`"
                >Relative Lateral Position (mm)</text>
            </svg>
        </template>
        <p v-else>No Data</p>
    </div>
</template>


<script lang="ts">
import Vue from 'vue';
import DataModel, {EventType} from '@/models/DataModel';
import {Layout} from '@/store/root.types';
import store from '@/store/root.store';
import SpinogramData from '@/metadata/spinogram.corpus-sorted-usage';

import * as d3 from 'd3';
import {line} from 'd3-shape';
import {scaleLinear} from 'd3-scale';

interface Spinogram {
    id: number;
    data: SpinogramTimepoint[];
}

interface SpinogramTimepoint {
    x: number[];
    y: number[];
    a: number;
}

store.commit('registerComponent', {
    friendly_name: 'Spinogram',
    component_type: 'spinogram-plots',
    // settings_type: 'detailed-usage-options',
    init_width: 400,
    init_height: 500,
    default_settings: {},
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
            has_data: false,
            current_data: [] as number[][][],
            current_alphas: [] as number[],
            margin: {
                top: 20,
                right: 20,
                bottom: 45,
                left: 45,
            },
            // watchers: Array<(() => void)>(),
        };
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
        xLabelPos(): number[] {
            return [this.outsideWidth / 2, this.outsideHeight];
        },
        origin(): any {
            const x = this.margin.left;
            const y = this.height + this.margin.top;
            return { x, y };
        },
        scale(): any {
            if (this.current_data === undefined) {
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
    },
    mounted() {
        this.createView();
        DataModel.subscribe(EventType.GROUPS_CHANGE, this.createView);
        DataModel.subscribe(EventType.SYLLABLE_CHANGE, this.createView);
    },
    destroyed() {
        // un-watch the store
        // this.watchers.forEach((w) => w());
        // unsubscribe from the data model
        DataModel.unsubscribe(EventType.GROUPS_CHANGE, this.createView);
        DataModel.unsubscribe(EventType.SYLLABLE_CHANGE, this.createView);
    },
    methods: {
        createView() {
            const sid = DataModel.getSelectedSyllable();
            const data = SpinogramData.find((s) => s.id === sid) as Spinogram;
            if (data !== undefined) {
                this.has_data = true;
                this.current_data = data.data.map((stp, idx) => {
                    return stp.x.map((tpx, jdx) => [ tpx, stp.y[jdx] ]);
                });
                this.current_alphas = data.data.map((stp, idx) => stp.a);
            } else {
                this.has_data = false;
            }
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
    stroke:#FF0000;
    stroke-width: 3;
    fill:none;
}

</style>