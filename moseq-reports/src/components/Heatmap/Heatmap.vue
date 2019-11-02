<template>
    <div ref="heatmap-container">
        <div ref='heatmap-graph'></div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Plotly from 'plotly.js';

import DataModel, { EventType } from '../../DataModel';
import SettingsModal from '@/components/SettingsModal.vue';
import HeatmapOptions from '@/components/Heatmap/HeatmapOptions.vue'

/* tslint:disable */
export default Vue.extend({
    name: 'heatmap',
    mounted() {
        this.settings.$props.owner = this;
        this.createHeatmap();

        DataModel.subscribe(EventType.GROUPS_CHANGE, this.createHeatmap);

        this.$parent.$on('resized', this.onResize);
        this.$nextTick().then(() => {
            this.onResize();
        });
    },
    data() {
        return {
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
