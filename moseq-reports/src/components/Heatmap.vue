<template>
    <div id="heatmap-container">
        <b-container>
            <b-row>
                <b-col>
                    <div id='heatmap-graph' style="display: flex"></div>
                </b-col>
                    <heatmap-options></heatmap-options>
                <b-col>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Plotly from 'plotly.js';

import DataModel from '../DataModel';
import EventBus from '../events/EventBus';
import HeatmapOptions from '@/components/HeatmapOptions.vue';

/* tslint:disable */
export default Vue.extend({
    name: 'heatmap',
    components: {
        'heatmap-options': HeatmapOptions,
    },
    mounted() {
        this.createHeatmap();

        EventBus.$on('updateSelectedGroups', ((event: any) => {
            this.createHeatmap();
        }));

        EventBus.$on('updateHeatmapColorscale', ((event: any) => {
            this.updateColorscale(event);
        }));
    },
    methods: {
        updateColorscale(scale: any) {
            Plotly.restyle('heatmap-graph', scale);
        },
        createHeatmap() {
            let df = DataModel.getUsageDataframe();

            //df.show();

            var groups = df.filter((row: any) => row.get('group')).distinct('group').toArray().flat();
            var sylNum = df.select('syllable').distinct('syllable').toArray().flat();

            var sylUsage = [];
            var usg = df.select('usage').toArray();
            var index = 0;
            for (let i = 0; i < sylNum.length; i++) {
                var temp = [];
                for (let j = 0; j < groups.length; j++) {
                    temp.push(usg[(j*sylNum.length)+i][0]);
                }
                sylUsage.push(temp);
            }

            const data = {
                type: 'heatmap',
                x: groups,
                y: sylNum,
                z: sylUsage,
                colorscale: 'Portland',
            } as Plotly.PlotData

            let layout = {
                title: 'Syllable Usage Heatmap',
                margin: {
                    t: 50,
                    b: 70
                },
                width: 720,
                height: 980,
                autosize: true,
                xaxis: {
                    autorange: true,
                    showgrid: false,
                    zeroline: false,
                    linecolor: 'black',
                    showticklabels: true,
                    side: 'bottom',
                    ticks: 'outside',
                },
                yaxis: {
                    showgrid: false,
                    zeroline: false,
                    linecolor: 'black',
                    showticklabels: true,
                    tick0: 0,
                    dtick: 1,
                    autorange: true,
                    side: 'left',
                    ticks: 'outside',
                }
            } as Plotly.Layout
            
            Plotly.react('heatmap-graph', [data], layout);
        },
    },
});
</script>

<style scoped lang="scss">

</style>
