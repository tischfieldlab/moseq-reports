<template>
    <div ref='heatmap-graph'></div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Plotly from 'plotly.js';

import DataModel, { EventType } from '@/models/DataModel';
import { transpose } from '@/Util';
import {Size, Layout, ComponentRegistration } from '@/store/root.types';
import store from '@/store/root.store';
import BaseDataComponent from '@/components/data_components/BaseDataComponent';

store.commit('registerComponent', <ComponentRegistration>{
    friendly_name: 'Usage Heatmap',
    component_type: 'heat-map',
    settings_type: 'heatmap-options',
    init_width: 400,
    init_height: 500,
    default_settings: {
        style: {
            colorscale: 'Portland',
        }
    }
});

/* tslint:disable */
export default Vue.component('heat-map', {
    extends: BaseDataComponent,
    mounted() {
        //watch for resize events, and update the heatmap size accordingly.
        store.watch(
            (state, getters) => {
                return getters.getWindowLayout(this.id);
            },
            (newValue: Layout, oldValue: Layout) => {
                this.onResize({
                    width: newValue.width,
                    height: newValue.height,
                });
            },
            {
                deep: true,
            }
        );
        store.watch(
            (state, getters) => {
                return getters.getWindowById(this.id).settings;
            },
            (newValue, oldValue) => {
                console.log('calling restyle', this.settings.style, newValue, oldValue);
                Plotly.restyle(this.$refs['heatmap-graph'], this.settings.style);
            },
            {
                deep: true,
            }
        );

        this.createHeatmap();

        DataModel.subscribe(EventType.GROUPS_CHANGE, this.createHeatmap);
    },
    destroyed(){
        DataModel.unsubscribe(EventType.GROUPS_CHANGE, this.createHeatmap);
    },
    data() {
        return {};
    },
    methods: {
        updateColorscale(scale: any) {
            Plotly.restyle(this.$refs['heatmap-graph'], scale);
        },
        onResize(newSize: Size) {
            Plotly.relayout(this.$refs['heatmap-graph'], {
                width: newSize.width - 10,
                height: newSize.height - 100
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
                    l: 50,
                    r: 10
                },
                width: this.layout.width - 10,
                height: this.layout.height - 100,
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
            
            const myPlot: HTMLElement = this.$refs['heatmap-graph'],
            d3 = Plotly.d3;

            //console.log(typeof myPlot);
            Plotly.newPlot(myPlot, [data], layout);

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
