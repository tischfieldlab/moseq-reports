<template>
<div>
    <svg ref="canvas" :width="width" :height="height" @mousemove="debouncedHover" @mouseleave="hoverItem = undefined">
        <g class="plot-area" :transform="`translate(${margin.left}, ${margin.top})`">
            <template v-for="(sdata, g) in groupedData">
                <g class="series" :key="g">
                    <g class="series-line" v-if="show_lines">
                        <path
                            :data-series="g"
                            :d="seriesPath(sdata)"
                            :stroke="scale.c(g)"
                            :stroke-width="line_weight"
                            fill="none" />
                    </g>
                    <g class="series-points" v-if="show_points">
                        <template v-for="p in sdata">
                            <g :key="`${p[seriesKey]}-${p[varKey]}`">
                                <line class="error"
                                    :x1="scale.x(p[varKey])"
                                    :x2="scale.x(p[varKey])"
                                    :y1="scale.y(p[valueKey] - p[errorKey])"
                                    :y2="scale.y(p[valueKey] + p[errorKey])"
                                    :stroke="scale.c(g)"
                                    :stroke-width="line_weight"
                                    />
                                <circle
                                    v-if="isPointValid(p)"
                                    
                                    :data-series="`${p[seriesKey]}`"
                                    :data-var="`${p[varKey]}`"
                                    :r="point_size"
                                    :cx="scale.x(p[varKey])"
                                    :cy="scale.y(p[valueKey])"
                                    :style="{'fill': scale.c(p[seriesKey]), stroke: '#000000'}" />
                            </g>
                        </template>
                    </g>
                </g>
            </template>
        </g>
        <g :class="{'x-axis':true, 'rotate': rotate_labels }" v-axis:x="scale" :transform="`translate(${margin.left},${origin.y})`">
            <text class="label" :y="xAxisLabelYPos" :x="(innerWidth / 2)">
                {{xAxisTitle}}
            </text>
        </g>
        <g class="y-axis" v-axis:y="scale" :transform="`translate(${margin.left},${margin.top})`">
            <text class="label" transform="rotate(-90)" :y="-45" :x="0 - (innerHeight/2)">
                {{yAxisTitle}}
            </text>
        </g>
    </svg>
    <ToolTip :position="tooltipPosition" :show="hoverItem !== undefined">
        <div v-html="tooltip_text" style="text-align:left;"></div>
    </ToolTip>
</div>
</template>


<script lang="ts">
import LoadingMixin from '@/components/Core/LoadingMixin'
import mixins from 'vue-typed-mixins';
import { scaleLinear, scalePoint, scaleOrdinal } from 'd3-scale';
import {line, Line} from 'd3-shape';
import Vue, { PropType } from 'vue'
import * as d3 from 'd3';
import {extent} from 'd3-array';
import { throttle } from '@/util/Events';
import ToolTip from '@/components/Charts/ToolTip.vue';
import MessageBox from '@/components/Charts/CenteredMessage.vue';



function default_tooltip_formatter(value: any, that) {
    return JSON.stringify(value, undefined, '\t');
}


export default mixins(LoadingMixin).extend({
    components: {
        ToolTip,
        MessageBox,
    },
    props: {
        data: {
            required: true,
            type: Array as PropType<object[]>,
        },
        seriesKey: {
            required: true,
            type: String,
        },
        varKey: {
            required: true,
            type: String,
        },
        valueKey: {
            required: true,
            type: String,
        },
        errorKey: {
            required: true,
            type: String,
        },
        varOrdering: {
            type: Array as PropType<any[]>,
        },
        width: {
            required: true,
            type: Number,
        },
        height: {
            required: true,
            type: Number,
        },
        show_points: {
            default: true,
            type: Boolean,
        },
        point_size: {
            default: 3,
            type: Number,
        },
        show_lines: {
            default: true,
            type: Boolean,
        },
        line_weight: {
            default: 3,
            type: Number,
        },
        xAxisTitle: {
            type: String,
            default: 'Variable',
        },
        yAxisTitle: {
            type: String,
            default: 'Value',
        },
        seriesLabels: {
            required: true,
            type: Array as PropType<string[]>,
            default: () => new Array<string>(),
        },
        seriesColors: {
            required: true,
            type: Array as PropType<string[]>,
            default: () => new Array<string>(),
        },
        tooltipFormatter: {
            type: Function,
            default: default_tooltip_formatter,
        },
    },
    data() {
        return {
            debouncedHover: (event: MouseEvent) => {/**/},
            margin: {
                top: 20,
                right: 20,
                bottom: 50,
                left: 60,
            },
            xAxisLabelYPos: 45,
            watchers: Array<(() => void)>(),
            rotate_labels: false,
            label_stats: {count: 0, total: 0, longest: 0},
            tooltipPosition: undefined as {x: number, y:number}|undefined,
            hoverItem: undefined as object|undefined,
        };
    },
    mounted() {
        this.debouncedHover = throttle(this.handleHover, 10);
    },
    computed: {
        origin(): any {
            const x = this.margin.left;
            const y = this.innerHeight + this.margin.top;
            return { x, y };
        },
        innerWidth(): number {
            const width = this.width - this.margin.left - this.margin.right;
            this.rotate_labels = this.label_stats.longest > width / this.label_stats.count;
            if (this.rotate_labels) {
                const rotatedHeight = Math.cos(45 * (Math.PI / 180)) * this.label_stats.longest;
                this.xAxisLabelYPos = rotatedHeight + 20;
            } else {
                this.xAxisLabelYPos = 45;
            }
            this.margin.bottom = this.xAxisLabelYPos + 20;
            return width;
        },
        innerHeight(): number {
            return this.height - this.margin.top - this.margin.bottom;
        },
        has_data(): boolean {
            return this.data !== undefined && this.data !== null && this.data.length > 0;
        },
        seriesPath(): Line<[number, number]> {
            return line()
                .defined((d) => this.isPointValid(d))
                .x((d) => this.scale.x(d[this.varKey]))
                .y((d) => this.scale.y(d[this.valueKey]))
        },
        groupedData(): object {
            const series = [...new Set(this.data.map(d => d[this.seriesKey]))];
            const kludges = this.varOrdering.filter((d) => Number.parseInt(d, 10) < 0);
            const grouped = Object.fromEntries(series.map((seriesValue) => {
                return [
                    seriesValue,
                    this.data
                        .filter((d) => d[this.seriesKey] === seriesValue)
                        .concat(kludges.map((k) => {
                            return {
                                [this.seriesKey]: seriesValue,
                                [this.varKey]: k,
                                [this.valueKey]: undefined,
                            }
                        }))
                        .sort((a, b) => this.varOrdering.indexOf(a[this.varKey]) - this.varOrdering.indexOf(b[this.varKey])),
                ];
            }));

            return grouped;
        },
        dataVars(): any[] {
            return [...new Set(this.data.map(d => d[this.varKey]))]
        },
        scale(): any {
            if (!this.has_data) {
                return { x: scalePoint(), y: scaleLinear(), c: scaleOrdinal() };
            }
            const x = scalePoint()
                .domain(this.varOrdering as string[])
                .range([0, this.innerWidth])
                .padding(0.5);

            let ext = [0, 0];
            if (this.data !== null) {
                ext = extent(this.data.flatMap((n) => {
                    return [
                        n[this.valueKey],
                        n[this.valueKey] + n[this.errorKey],
                        n[this.valueKey] - n[this.errorKey],
                    ];
                })) as [number, number];
            }
            const y = scaleLinear()
                .domain(ext as [number, number])
                .range([this.innerHeight, 0]);

            const c = scaleOrdinal()
                .domain(this.seriesLabels as string[])
                .range(this.seriesColors as string[]);

            return { x, y, c };
        },
        tooltip_text(): string {
            if (this.hoverItem !== undefined){
                return (this.tooltipFormatter as (itm, that) => string)(this.hoverItem, this);
            }
            return '';
        },
    },
    methods: {
        isPointValid(d: object) {
            return !Number.isNaN(this.scale.x(d[this.varKey]))
                && !Number.isNaN(this.scale.y(d[this.valueKey]));
        },
        seriesData(seriesValue) {
            return this.data.filter((d) => d[this.seriesKey] === seriesValue);
        },
        handleHover(event: MouseEvent) {
            if (event && event.target !== null){
                const target = event.target as HTMLElement;
                // individual points have data-var set
                if (target.dataset.var) {
                    this.tooltipPosition = {
                        x: event.clientX,
                        y: event.clientY
                    };
                    this.hoverItem = this.data.find((itm) => {
                        return itm[this.varKey].toString() === target.dataset.var
                            && itm[this.seriesKey].toString() === target.dataset.series;
                    });
                    return;
                }
            }
            this.tooltipPosition = undefined;
            this.hoverItem = undefined;
        },
    },
    directives: {
        axis(el, binding) {
            const axis = binding.arg;
            if (axis !== undefined) {
                const axisMethod = { x: 'axisBottom', y: 'axisLeft' }[axis] as string;
                const methodArg = binding.value[axis];
                d3.select(el).call(d3[axisMethod](methodArg));
            }
        },
    },
});
</script>


<style scoped>
svg >>> g.x-axis text.label,
svg >>> g.y-axis text.label {
    text-anchor:middle;
    fill:#000;
    font-family: Verdana,Arial,sans-serif;
    font-size: 12px;
}
svg >>> g.x-axis.rotate g.tick text {
    transform: translate(-10px,0px) rotate(-45deg);
    text-anchor: end;
}
svg >>> line,
svg >>> rect {
    shape-rendering: crispEdges;
}
svg >>> circle,
svg >>> path {
    shape-rendering: geometricPrecision;
}
</style>