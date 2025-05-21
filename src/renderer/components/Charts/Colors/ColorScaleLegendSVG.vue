<template>
    <g class="legend">
        <!-- Gradient Definition -->
        <defs>
            <linearGradient :id="gradientId" :x1="offsets.x1" :x2="offsets.x2" :y1="offsets.y1" :y2="offsets.y2">
                <stop
                    v-for="d in stops"
                    :key="`${d.v}_${d.z}`"
                    :offset="`${d.v}%`"
                    :stop-color="d.z"
                />
            </linearGradient>
        </defs>

        <!-- Gradient Bar -->
        <rect
            :x="-width / 2"
            :y="0"
            :width="width"
            :height="height"
            :fill="`url(#${gradientId})`"
        />

        <!-- Axis -->
        <g v-cbar-axis :transform="`translate(${axis_translate.x},${axis_translate.y})`" />

        <!-- Label -->
        <text class="label"
            :x="label_translate.x"
            :y="label_translate.y"
            :transform="`rotate(${label_translate.r})`"
        >
            {{ title }}
        </text>
    </g>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import * as d3 from "d3";
import { axisBottom, axisRight } from "d3-axis";
import { ColorScaleLegendProps, ColorScaleLegendPropsDefaults, useColorScaleLegendBase } from "./ColorScaleLegendBase";
import { Orientation } from "./Colors.types";
import { Directive } from "vue";
import { v4 as uuidv4 } from 'uuid';

const props = withDefaults(defineProps<ColorScaleLegendProps>(), ColorScaleLegendPropsDefaults);
const {axis_translate, label_translate, linearscale, offsets, stops} = useColorScaleLegendBase(props);
const gradientId = ref(`color-gradient-${uuidv4()}`);


const calculateNumTicks = (el) => {
    const nodes = d3
        .select(el)
        .selectAll("g.tick text")
        .nodes()
        .map((n) => (n as SVGTextElement).getBBox());

    const maxWidth = Math.max(...nodes.map((n) => n.width), 10);
    const maxHeight = Math.max(...nodes.map((n) => n.height), 10);

    let numTicks =
        props.orientation === Orientation.Horizontal
        ? props.width / (maxWidth * 2)
        : props.height / maxHeight;

    return Math.max(props.minticks, Math.min(numTicks, props.maxticks));
};

const renderAxis = (el) => {

    const axisType = props.orientation === Orientation.Horizontal ? axisBottom : axisRight;
    const axis = axisType(linearscale.value);

    const numTicks = calculateNumTicks(el);
    axis.ticks(Math.round(numTicks), props.tickformat);

    d3.select(el).call(axis as any);
};

const vCbarAxis: Directive = {
    mounted: (el) => {renderAxis(el); nextTick().then(() => renderAxis(el));},
    updated: renderAxis,
}
</script>

<style>
g.legend text.label {
  font-family: Verdana, Arial, sans-serif;
  font-size: 13px;
  text-anchor: middle;
  fill: #000;
}
g.legend g.tick line {
  stroke: #888;
  shape-rendering: crispEdges;
}
g.legend g.tick text,
g.legend text.label {
  fill: #888;
}
g.legend path.domain {
  stroke: none;
}
</style>
