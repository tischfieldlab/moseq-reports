<template>
    <g class="legend">
        <defs>
            <linearGradient :id="$id('color-gradiant')" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" :stop-color="scale(scale.domain()[0])" />
                <stop offset="100%" :stop-color="scale(scale.domain()[1])" />
            </linearGradient>
        </defs>
        <rect
            :x="-width / 2"
            :y="0"
            :width="width"
            :height="height"
            :fill="`url(${$idRef('color-gradiant')})`"
            />
        <g v-axis:c="linearscale" :transform="`translate(0,${height})`" />
        <text class="label" x="0" :y="height*5">Transition Probability</text>
    </g>
</template>

<script lang="ts">
import Vue from 'vue';
import * as d3 from 'd3';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';


export default Vue.component('color-scale-legend', {
    props: {
        scale: {
            type: Object,
            required: true,
        },
        width: {
            type: Number,
            required: true,
        },
        height: {
            type: Number,
            required: true,
        },
    },
    computed: {
        linearscale(): ScaleLinear<number, number> {
            return scaleLinear()
                .domain(this.scale.domain())
                .range([-this.width / 2, this.width / 2]);
        },
    },
    directives: {
        axis(el, binding, vnode) {
            const actualAxis = axisBottom(binding.value);
            actualAxis.ticks(5); // if colorbar axis, only show 5 ticks
            d3.select(el).call(actualAxis as any); // build the axis
        },
    },
});
</script>