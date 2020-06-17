<template>
    <div>
        <template v-if="has_data">
            <b-pagination
                v-if="num_examples > 0"
                v-model="example_num"
                :total-rows="num_examples"
                :per-page="1"
                :limit="num_examples"
                align="fill"
                hide-goto-end-buttons="true"
                size="sm"></b-pagination>
            
            <svg :width="outsideWidth" :height="outsideHeight">
                <text class="title" :x="this.outsideWidth / 2" :y="20">
                    Module #{{ selectedSyllable }} ({{countMethod}}) Spinogram
                </text>
                <g :transform="`translate(${margin.left}, ${margin.top})`">
                    <template v-for="(tp, idx) in spinogram_data">
                        <path 
                            v-bind:key="idx"
                            :d="line(tp.xy)"
                            :stroke="line_color"
                            :stroke-width="line_weight"
                            :style="{opacity:tp.a}"
                            :data-time="tp.t" />
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
                <ColorScaleLegend
                    title="Time (ms)"
                    :scale="scale.t"
                    :width="100"
                    :height="10"
                    :transform="`translate(${width}, 25)`" />
            </svg>
        </template>
        <div v-else class="no-data">
            <b-card bg-variant="primary" text-variant="white" class="text-center">
                <b-card-text>
                    Sorry, there are no spinograms available for Syllable {{selectedSyllable}} ({{countMethod}})
                </b-card-text>
            </b-card>
        </div>
    </div>
</template>


<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/Core';

import * as d3 from 'd3';
import { line } from 'd3-shape';
import { scaleLinear, scaleSequential } from 'd3-scale';
import { CountMethod } from '@/store/dataview.types';
import LoadingMixin from '@/components/Core/LoadingMixin';
import WindowMixin from '@/components/Core/WindowMixin';
import mixins from 'vue-typed-mixins';
import {rgb} from 'd3-color';
import ColorScaleLegend from '@/components/Charts/ColorScaleLegend/ColorScaleLegendSVG.vue';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import { extent } from 'd3';
import { Operation } from '../../Core/DataLoader/DataLoader.types';


interface Spinogram {
    data: SpinogramTimepoint[];
}

interface SpinogramTimepoint {
    x: number[];
    y: number[];
    xy: number[][];
    a: number;
    t: number;
}

RegisterDataComponent({
    friendly_name: 'Spinogram',
    component_type: 'Spinogram',
    settings_type: 'SpinogramOptions',
    init_width: 400,
    init_height: 250,
    default_settings: {
        line_color: '#FF0000',
        line_weight: 2,
    },
});


export default mixins(LoadingMixin, WindowMixin).extend({
    components: {
        ColorScaleLegend,
    },
    data() {
        return {
            items: [] as Spinogram[],
            example_num: 1,
            margin: {
                top: 30,
                right: 20,
                bottom: 45,
                left: 45,
            },
        };
    },
    computed: {
        spinogram_data(): Readonly<SpinogramTimepoint[]> {
            if (this.example_num - 1 < this.items.length) {
                return this.items[this.example_num - 1].data;
            }
            return [];
        },
        num_examples(): number {
            return this.items.length;
        },
        width(): number {
            return this.outsideWidth - this.margin.left - this.margin.right;
        },
        height(): number {
            return this.outsideHeight - this.margin.top - this.margin.bottom;
        },
        legendHeight(): number {
            const h = this.height * 0.75;
            if (h < 25) {
                return 25;
            } else if (h > 150) {
                return 150;
            }
            return h;
        },
        outsideWidth(): number {
            return this.layout.width;
        },
        outsideHeight(): number {
            return this.layout.height - 31 - 31;
        },
        origin(): any {
            const x = this.margin.left;
            const y = this.height + this.margin.top;
            return { x, y };
        },
        scale(): any {
            if (this.spinogram_data === undefined || this.spinogram_data.length === 0) {
                return { x: scaleLinear(), y: scaleLinear(), t: scaleSequential((n) => n) };
            }
            const x = scaleLinear()
                .domain([0, 200])
                .rangeRound([0, this.width]);
            const y = scaleLinear()
                .domain([0, 100])
                .rangeRound([this.height, 0]);

            const c = rgb(this.line_color);
            const ae = extent(this.spinogram_data.map((tp) => tp.a)) as [number, number];
            const te = extent(this.spinogram_data.map((tp) => tp.t)) as [number, number];
            const t = scaleSequential(d3.interpolateRgb(
                    rgb(c.r, c.g, c.b, ae[0]).toString(),
                    rgb(c.r, c.g, c.b, ae[1]).toString(),
                ))
                .domain(te);
            return { x, y, t };
        },
        line(): any {
            const a = line()
                .defined(([x, y]) => !Number.isNaN(x) && !Number.isNaN(y))
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
            return this.dataview.selectedSyllable;
        },
        countMethod(): string {
            return this.dataview.countMethod;
        },
        has_data(): boolean {
            return this.items.length > 0;
        },
        dataspec(): [string, Operation[]] {
            return [
                this.$store.getters[`datasets/resolve`]('spinograms'),
                [
                    {
                        type: 'map',
                    },
                    {
                        type: 'filter',
                        filters: {
                            [`sid_${this.countMethod.toLowerCase()}`]: [this.selectedSyllable],
                        },
                    },
                ],
            ];
        },
    },
    watch: {
        dataspec: {
            handler() {
                LoadData(this.dataspec[0], this.dataspec[1])
                .then((data: any[]) => {
                    if (data && data.length > 0) {
                        for (const itm of data) {
                            const d = itm.data;
                            d.forEach((stp, idx) => {
                                stp.xy = stp.x.map((tpx, jdx) => [ tpx, stp.y[jdx] ]);
                            });
                        }
                    }
                    this.items = data;
                });
            },
            immediate: true,
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
svg >>> g.legend text.label {
    font-size: 10px;
    transform: translateY(-10px);
}

.b-pagination {
    margin-bottom:0;
}
.no-data .card {
    width: 75%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>