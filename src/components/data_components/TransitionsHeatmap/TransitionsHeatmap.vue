<template>
    <svg ref="canvas" width="100%" height="100%">
        <template v-for="(group_values, group_name) in transitions">
            <g v-if="selectedGroups.includes(group_name)" :key="group_name" :class="{heatmap:true, [group_name]:true}">
                <template v-for="(rows, row_id) in group_values">
                    <template v-for="(value, col_id) in rows">
                        <rect 
                            :key="`${group_name}_${row_id}_${col_id}`"
                            :x="scale.x[group_name](col_id)"
                            :y="scale.y[group_name](row_id)"
                            :fill="scale.z(value)"
                            :data-group="group_name"
                            :data-transition="`${row_id}->${col_id}`"
                            :data-value="value"
                            :width="scale.x[group_name].bandwidth()"
                            :height="scale.y[group_name].bandwidth()"
                            shape-rendering="crispEdges"
                            />
                    </template>
                </template>
            </g>
        </template>
    </svg>
</template>


<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/data_components/Core';
import { GetScale } from '@/util/D3ColorProvider';

import { scaleLinear, scaleBand, scaleOrdinal, scaleSequential } from 'd3-scale';
import {range} from 'd3-array';


RegisterDataComponent({
    friendly_name: 'Transitions Heatmap',
    component_type: 'transitions-heatmap',
    // settings_type: 'ClusteredHeatmapOptions',
    init_width: 400,
    init_height: 500,
    default_settings: {
        colormap: 'interpolateViridis',
    },
});

export default Vue.component('transitions-heatmap', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    data(){
        return {
            transitions: null,
            sub_padding: 5,
            sub_size: 200,
            colormap: 'interpolateViridis',
            vmin: Number.MAX_VALUE,
            vmax: Number.MIN_VALUE,
        };
    },
    computed: {
        scale(): any {
            const s = {
                x: {},
                y: {},
                z: null as any,
            };
            for(const [i, g] of this.selectedGroups.entries()){
                const offset = (i * (this.sub_size + this.sub_padding));
                s.x[g] = scaleBand()
                    .domain(range(100) as any[])
                    .range([offset, offset + this.sub_size])
                    .padding(0);
                s.y[g] = scaleBand()
                    .domain(range(100) as any[])
                    .range([this.sub_size, 0])
                    .padding(0);
            }
            s.z = scaleSequential(GetScale(this.colormap))
                .domain([this.vmin, this.vmax]);
            /*const c = scaleLinear()
                .domain(z.domain())
                .range([-this.dims.legend.w / 2, this.dims.legend.w / 2]);*/
            console.log(s);
            return s/*{ x, y, z, c }*/;
        },
        settings(): any {
            return this.$store.getters.getWindowById(this.id).settings;
        },
        selectedGroups(): string[] {
            return this.$store.state.dataview.selectedGroups;
        },
    },
    mounted() {
        this.prepare_data();
    },
    methods: {
        prepare_data(){
            const trans = this.$store.getters['dataview/transitions'];
            
            let vmin = Number.MAX_VALUE;
            let vmax = Number.MIN_VALUE;
            for (const g of this.selectedGroups) {
                console.log(g);
                for (const i in trans[g]) {
                    vmin = Math.min(vmin, ...trans[g][i]);
                    vmax = Math.max(vmax, ...trans[g][i]);
                }
            }
            this.vmin = vmin;
            this.vmax = vmax;
            this.transitions = trans;
        },
    },
});
</script>


<style scoped>

</style>