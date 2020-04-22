<template>
    <g class="legend">
        <defs>
            <linearGradient :id="$id('color-gradiant')" :x1="offsets.x1" :x2="offsets.x2" :y1="offsets.y1" :y2="offsets.y2">
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
        <g v-axis:[orientation]="linearscale" :transform="`translate(${axis_translate.x},${axis_translate.y})`" />
        <text class="label"
            :x="label_translate.x"
            :y="label_translate.y"
            :transform="`rotate(${label_translate.r})`">
            {{ title }}
        </text>
    </g>
</template>

<script lang="ts">
import Vue from 'vue';
import * as d3 from 'd3';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { axisBottom, axisRight } from 'd3-axis';

export enum Orientation {
    Horizontal = 'horizontal',
    Vertical = 'vertical',
}


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
        title: {
            type: String,
            required: true,
        },
        orientation: {
            type: Object,
            default: Orientation.Horizontal,
        },
        maxticks: {
            type: Number,
            default: 5,
        },
        minticks: {
            type: Number,
            default: 1,
        },
        tickformat: {
            type: String,
            default: null,
        },
    },
    computed: {
        offsets(): any {
            if (this.orientation === Orientation.Horizontal) {
                return {
                    x1: '0%',
                    x2: '100%',
                    y1: '0%',
                    y2: '0%',
                };
            } else {
                return {
                    x1: '0%',
                    x2: '0%',
                    y1: '100%',
                    y2: '0%',
                };
            }
        },
        axis_translate(): any {
            if (this.orientation === Orientation.Horizontal) {
                return {
                    x: 0,
                    y: this.height,
                };
            } else {
                return {
                    x: this.width / 2,
                    y: this.height / 2,
                };
            }
        },
        label_translate(): any {
            if (this.orientation === Orientation.Horizontal) {
                return {
                    x: 0,
                    y: this.height + 18 + 20,
                    r: 0,
                };
            } else {
                return {
                    x: -this.height / 2,
                    y: this.width + 18 + 20,
                    r: -90,
                };
            }
        },
        isHorizontal(): boolean {
            return this.orientation === Orientation.Horizontal;
        },
        linearscale(): ScaleLinear<number, number> {
            const range = this.isHorizontal ? [-this.width / 2, this.width / 2] : [this.height / 2, -this.height / 2];
            return scaleLinear()
                .domain(this.scale.domain())
                .range(range);
        },
    },
    directives: {
        axis(el, binding, vnode) {
            if (binding.arg !== undefined) {
                const cxt = vnode.context as any;
                const aMap = {
                    [Orientation.Horizontal]: axisBottom,
                    [Orientation.Vertical]: axisRight,
                };
                const actualAxis = aMap[binding.arg](binding.value);

                // place the ticks and then measure size
                d3.select(el).call(actualAxis as any);
                const nodes = d3.select(el)
                                .selectAll('g.tick text')
                                .nodes()
                                .map((n) => (n as SVGTextElement).getBBox());
                const maxWidth = Math.max(...nodes.map((n) => n.width));
                const maxHeight = Math.max(...nodes.map((n) => n.height));

                // compute the optimal number of ticks, clamping to min/max
                let numTicks = 0;
                if (cxt.orientation === Orientation.Horizontal) {
                    numTicks = cxt.width / (maxWidth * 2);
                } else {
                    numTicks = cxt.height / maxHeight;
                }
                if (numTicks > cxt.maxticks) {
                    numTicks = cxt.maxticks;
                } else if (numTicks < cxt.minticks) {
                    numTicks = cxt.minticks;
                }

                // redraw the axis with the specified number of ticks
                actualAxis.ticks(numTicks.toFixed(0), cxt.tickformat); // if colorbar axis, only show 5 ticks
                d3.select(el).call(actualAxis as any); // build the axis
            }
        },
    },
});
</script>

<style>
g.legend text.label {
    font-family: Verdana,Arial,sans-serif;
    font-size: 13px;
    text-anchor:middle;
    fill:#000;
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
    stroke:none;
}
</style>