<template>
    <div ref='heatmap-graph'></div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Plotly from 'plotly.js';

import DataModel, { EventType } from '@/models/DataModel';
import SettingsModal from '@/components/SettingsModal.vue';
import HeatmapOptions from '@/components/Heatmap/HeatmapOptions.vue'
import {transpose} from '../../Util';

/* tslint:disable */
export default Vue.component('heat-map', {
    name: 'heat-map',
    mounted() {
        this.settings.$props.owner = this;
        this.createHeatmap();

        DataModel.subscribe(EventType.GROUPS_CHANGE, this.createHeatmap);

        this.$parent.$on('resized', this.onResize);
        this.$nextTick().then(() => {
            this.onResize();
        });
    },
    destroyed(){
        DataModel.unsubscribe(EventType.GROUPS_CHANGE, this.createHeatmap);
    },
    data() {
        return {
            title: "Syllable Usage Heatmap",
            settings: new HeatmapOptions(),
        };
    },
    methods: {
        updateColorscale(scale: any) {
            Plotly.restyle(this.$refs['heatmap-graph'], scale);
        },
        onResize() {
            Plotly.relayout(this.$refs['heatmap-graph'], {
                width: this.$parent.width - 10,
                height: this.$parent.height - 100
            });
        },
        createHeatmap() {
            let df = DataModel.getAggregateView();

            var groups = DataModel.getSelectedGroups();;
            var sylNum = df.select('syllable').distinct('syllable').toArray().flat();

            var sylUsage = [];
            for(const g of groups){
                sylUsage.push(df.where({'group': g}).select('usage').toArray().flat());
            }
            sylUsage = transpose(sylUsage);

            const data = {
                type: 'heatmap',
                x: groups,
                y: sylNum,
                z: sylUsage,
                colorscale: this.settings.selectedColor,
            } as Plotly.PlotData

            let layout = {
                //title: 'Syllable Usage Heatmap',
                margin: {
                    t: 10,
                    b: 70,
                    l:50,
                    r:10
                },
                width: this.$parent.width - 10,
                height: this.$parent.height - 100,
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
                    title: "Syllable (ID)",
                }
            } as Plotly.Layout
            
            var myPlot: any = this.$refs['heatmap-graph'],
            d3 = Plotly.d3;

            Plotly.newPlot(this.$refs['heatmap-graph'], [data], layout);

            var syllable : number = 0;
            myPlot.on('plotly_click', function(data : any){
                var pts = '';
                for(var i=0; i < data.points.length; i++){
                    pts = 'x = '+data.points[i].x +'\ny = '+
                        data.points[i].y + '\nz = ' + 
                        data.points[i].z.toPrecision(4) + '\n\n';
                    syllable = Number.parseInt(data.points[i].y);
                }

                DataModel.updateSelectedSyllable(syllable);
            });
        },
    }
});
</script>

<style scoped lang="scss">

</style>
