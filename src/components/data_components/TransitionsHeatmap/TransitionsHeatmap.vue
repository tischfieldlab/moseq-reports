<template>
    <svg ref="canvas" :width="outsideWidth" :height="outsideHeight">
        <template v-for="group_name in selectedGroups">
            <g v-if="selectedGroups.includes(group_name)" 
                :key="group_name" 
                :class="{heatmap:true, [group_name]:true}"
                :transform="`translate(${scale.o(group_name)},0)`">

                <text class="label" :x="scale.o.bandwidth()/2" :y="10">{{ group_name }}</text>
                <g class="heat-tiles" transform="translate(0, 20)">
                    <template v-for="(rows, row_id) in group_transitions(group_name)">
                        <template v-for="(value, col_id) in rows">
                            <rect 
                                :key="`${group_name}_${row_id}_${col_id}`"
                                :x="scale.x(col_id)"
                                :y="scale.y(row_id)"
                                :fill="group_z(group_name)(value)"
                                :data-group="group_name"
                                :data-transition="`${row_id}->${col_id}`"
                                :data-value="value"
                                :width="scale.x.bandwidth()"
                                :height="scale.y.bandwidth()"
                                :class="{'selected': selected_transition === `${row_id}->${col_id}`}"
                                shape-rendering="crispEdges"
                                @click="highlight_transition"
                                />
                        </template>
                    </template>
                </g>
            </g>
        </template>
        <ColorScaleLegend :scale="scale.absz" :width="width / 2" :height="50" :transform="`translate(${outsideWidth / 2}, ${scale.o.bandwidth()+40})`" />
        <!--<g class="legend" :transform="`translate(${outsideWidth / 2}, ${scale.o.bandwidth()+40})`">
            <defs>
                <linearGradient :id="`color_gradiant_${id}`" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" :stop-color="scale.absz(scale.absz.domain()[0])" />
                    <stop offset="100%" :stop-color="scale.absz(scale.absz.domain()[1])" />
                </linearGradient>
            </defs>
            <rect
                :x="-width / 4"
                :y="0"
                :width="width / 2"
                :height="10"
                :fill="`url(#color_gradiant_${id})`"
                />
            <g v-axis:c="scale" transform="translate(0,10)" />
            <text class="label" x="0" y="50">Transition Probability</text>
        </g>-->
    </svg>
</template>


<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/Core';
import * as d3 from 'd3';
import { GetScale } from '@/util/D3ColorProvider';
import { scaleLinear, scaleBand, scaleOrdinal, scaleSequential } from 'd3-scale';
import { range } from 'd3-array';
import ColorScaleLegend from '@/components/Core/ColorScaleLegend.vue';
import mixins from 'vue-typed-mixins';
import LoadingMixin from '@/components/Core/LoadingMixin';
import WindowMixin from '@/components/Core/WindowMixin';


RegisterDataComponent({
    friendly_name: 'Transitions Heatmap',
    component_type: 'TransitionsHeatmap',
    settings_type: 'TransitionsHeatmapOptions',
    init_width: 400,
    init_height: 500,
    default_settings: {
        abs_colormap: 'interpolateViridis',
        rel_colormap: 'interpolatePuOr',
    },
});

export default mixins(LoadingMixin, WindowMixin).extend({
    components: {
        ColorScaleLegend,
    },
    data() {
        return {
            abs_transitions: {},
            rel_transitions: {},
            selected_transition: '',
            sub_padding: 5,
            abs_vmin: Number.MAX_VALUE,
            abs_vmax: Number.MIN_VALUE,
            rel_vmin: Number.MAX_VALUE,
            rel_vmax: Number.MIN_VALUE,
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
        };
    },
    computed: {
        outsideWidth(): number {
            return this.layout.width - 10;
        },
        outsideHeight(): number {
            return this.layout.height - 41;
        },
        width(): number {
            return this.outsideWidth - this.margin.left - this.margin.right;
        },
        height(): number {
            return this.outsideHeight - this.margin.top - this.margin.bottom;
        },
        scale(): any {
            const o = scaleBand()
                    .domain(this.selectedGroups)
                    .rangeRound([0, this.outsideWidth])
                    .paddingInner(this.sub_padding / this.outsideWidth);
            const x = scaleBand()
                    .domain(range(100) as any[])
                    .range([0, o.bandwidth()])
                    .padding(0);
            const y = scaleBand()
                    .domain(range(100) as any[])
                    .range([o.bandwidth(), 0])
                    .padding(0);
            const absz = scaleSequential(this.abs_colormap)
                .domain([this.abs_vmin, this.abs_vmax]);
            const relz = scaleSequential(this.rel_colormap)
                .domain([this.rel_vmin, this.rel_vmax]);
            const c = scaleLinear()
                .domain(absz.domain())
                .range([-this.width / 4, this.width / 4]);
            return { x, y, absz, relz, o, c };
        },
        abs_colormap(): any {
            return GetScale(this.settings.abs_colormap);
        },
        rel_colormap(): any {
            return GetScale(this.settings.rel_colormap);
        },
        selectedGroups(): string[] {
            return this.dataview.selectedGroups;
        },
        rootGroup(): string {
            return this.settings.relative_diff_group;
        },
    },
    mounted() {
        this.prepare_data();
    },
    methods: {
        group_transitions(group: string) {
            if (this.settings.show_relative_diff && group !== this.rootGroup) {
                return this.rel_transitions[group];
            }
            return this.abs_transitions[group];
        },
        group_z(group: string) {
            if (this.settings.show_relative_diff && group !== this.rootGroup) {
                return this.scale.relz;
            }
            return this.scale.absz;
        },
        prepare_data() {
            const absTrans = JSON.parse(JSON.stringify(this.$store.getters[`${this.datasource}/transitions`]));
            const relTrans = JSON.parse(JSON.stringify(absTrans));
            const root = this.selectedGroups[0];

            let absVmin = Number.MAX_VALUE;
            let absVmax = Number.MIN_VALUE;
            let relVmin = Number.MAX_VALUE;
            let relVmax = Number.MIN_VALUE;

            for (const g of this.selectedGroups) {
                for (let i = 0; i < absTrans[g].length; i++) {
                    absVmin = Math.min(absVmin, ...absTrans[g][i]);
                    absVmax = Math.max(absVmax, ...absTrans[g][i]);

                    for (let j = 0; j < relTrans[g][i].length; j++) {
                        relTrans[g][i][j] = relTrans[g][i][j] - relTrans[root][i][j];
                    }
                    relVmin = Math.min(relVmin, ...relTrans[g][i]);
                    relVmax = Math.max(relVmax, ...relTrans[g][i]);
                }
            }
            this.abs_vmin = absVmin;
            this.abs_vmax = absVmax;
            this.rel_vmin = -Math.max(Math.abs(relVmin), Math.abs(relVmax));
            this.rel_vmax = Math.max(Math.abs(relVmin), Math.abs(relVmax));
            this.abs_transitions = absTrans;
            this.rel_transitions = relTrans;
        },
        highlight_transition(event: MouseEvent) {
            if (event && event.srcElement && event.srcElement instanceof SVGRectElement) {
                const t = event.srcElement.dataset.transition as string;
                this.selected_transition = t;
            }
        },
    },
    directives: {
        axis(el, binding, vnode) {
            // console.log('axis directive called', el, binding);
            const axis = binding.arg;
            if (axis !== undefined) {
                const axisMethod = { x: 'axisBottom', y: 'axisRight', c: 'axisBottom' }[axis];
                const methodArg = binding.value[axis];
                const actualAxis = d3[axisMethod](methodArg);

                // if colorbar axis, only show 5 ticks
                if (axis === 'c') {
                    actualAxis.ticks(5);
                }

                // build the axis
                d3.select(el).call(actualAxis);
            }
        },
    },
});
</script>


<style scoped>
svg >>> g.heatmap text.label,
svg >>> g.legend text.label {
    font-family: Verdana,Arial,sans-serif;
    font-size: 13px;
    text-anchor:middle;
    fill:#000;
}
svg >>> g.legend g.tick line {
    stroke: #888;
}
svg >>> g.legend g.tick text,
svg >>> g.legend text.label {
    fill: #888;
}
svg >>> g.legend path.domain {
    stroke:none;
}

svg >>> rect.selected {
    transform: matrix(3,0,0,3,0,0);
    transform-origin: 50% 50%;
    stroke: #000;
}
</style>