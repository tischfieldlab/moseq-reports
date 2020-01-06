<template>
    <div id="heatmap-container" style="display: flex; justify-content: space-between;">
        <div id='heatmap-graph'></div>
    </div>
</template>

<style>
#d3tooltip {
    position: absolute;
    width: 200px;
    height: auto;
    padding: 10px;
    background-color: #fafafa;
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
    -webkit-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
    -moz-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
    box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
    pointer-events: none;
    opacity:0;
}

#d3tooltip.hidden {
    display: none;
}

#d3tooltip p {
    margin: 0;
    font-family: sans-serif;
    font-size: 12px;
    line-height: 20px;
}

rect.selection {
    stroke  : #333;
    stroke-dasharray: 4px;
    stroke-opacity  : 0.5;
    fill: transparent;
}

rect.cell-border {
    stroke: #eee;
    stroke-width:0.3px;
}

rect.cell-selected {
    stroke: rgb(51,102,153);
    stroke-width:0.5px;
}

rect.cell-hover {
    stroke: #F00;
    stroke-width:0.3px;
}
text.mono {
    font-size: 9pt;
    font-family: Consolas, courier;
    fill: #aaa;
}

.rlink, .clink {
    fill: none;
    stroke: #ccc;
    stroke-width: 1.5px;
}
</style>

<script lang="ts">
import Vue from 'vue';
// import * as Plotly from 'plotly.js';
import clusterGen from './cluster_gen';
import createHeatmap from './d3-heatmap-dendro_moseq2';
import store from '@/store/root.store';

import DataModel, { EventType } from '@/models/DataModel';

store.commit('registerComponent', {
    friendly_name: 'Clustered Usage Heatmap',
    component_type: 'clustered-heatmap',
    settings_type: 'clustered-heatmap-options',
    init_width: 400,
    init_height: 500,
    default_settings: {
        style: {
            colorscale: 'Portland',
        },
    },
});

/* tslint:disable */
export default Vue.extend({
    name: 'clustered-heatmap',
    mounted() {
        this.createHeatmap();

        DataModel.subscribe(EventType.GROUPS_CHANGE, this.createHeatmap);
    },
    data() {
        return {};
    },
    methods: {
        createHeatmap() {
            let df = DataModel.getAggregateView();

            var groups = df.filter((row: any) => row.get('group')).distinct('group').toArray().flat();
            var sylNum = df.select('syllable').distinct('syllable').toArray().flat();

            var rawData = [] as any; // Change from 'any'
            var usg = df.select('usage').toArray();
            var index = 0;
            for (let i = 0; i < groups.length; i++) {
                rawData[i] = {
                    "name":groups[i],
                    "usage":[] as any // Change from 'any'
                };
                for (let j = 0; j < sylNum.length; j++) {
                    rawData[i].usage.push(usg[(i*sylNum.length)+j][0]);
                }
            }
            let clusterData = clusterGen(rawData);
            createHeatmap(clusterData, '#heatmap-graph');
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