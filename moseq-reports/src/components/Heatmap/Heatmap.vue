<template>
    <div id="heatmap-container" style="display: flex; justify-content: space-between;">
        <div id='heatmap-graph'></div>

        <div id="heatmap-settings">
            <input type="image" name="heatmap-wheel" @click="showSettingsModal = true"
                src="https://static.thenounproject.com/png/333746-200.png">
            <heatmap-settings-modal v-if="showSettingsModal" @close="showSettingsModal = false"></heatmap-settings-modal>     
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Plotly from 'plotly.js';

import DataModel, { EventType } from '../../DataModel';
import SettingsModal from '@/components/Heatmap/SettingsModal.vue';

/* tslint:disable */
export default Vue.extend({
    name: 'heatmap',
    components: {
        'heatmap-settings-modal': SettingsModal, 
    },
    mounted() {
        this.createHeatmap();

        DataModel.subscribe(EventType.GROUPS_CHANGE, this.createHeatmap);
    },
    data() {
            return {
                showSettingsModal: false,
            };
    },
    methods: {
        updateColorscale(scale: any) {
            Plotly.restyle('heatmap-graph', scale);
        },
        __transpose(data:Array<Array<number>>){
            return data[0].map((col, i) => data.map(row => row[i]));
        },
        createHeatmap() {
            let df = DataModel.getAggregateView();

            var groups = DataModel.getSelectedGroups();
            var sylNum = df.select('syllable').distinct('syllable').toArray().flat();

            var sylUsage = [];
            for(const g of groups){
                sylUsage.push(df.where({'group': g}).select('usage').toArray().flat());
            }
            sylUsage = this.__transpose(sylUsage);


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
            
            var myPlot: any = document.getElementById('heatmap-graph'),
            d3 = Plotly.d3;

            Plotly.newPlot('heatmap-graph', [data], layout);

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
    },
});
</script>

<style scoped lang="scss">
input {
    width: 35px;
    height: 35px;
    margin-top: 40px;
    margin-left: -35px;
    position: absolute;
}    

input:hover {
    box-shadow: 0 0 2px 1px rgba(0, 140, 186, 0.5);
}
</style>
