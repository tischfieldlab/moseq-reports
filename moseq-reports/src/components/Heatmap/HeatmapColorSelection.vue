<template>
    <div id="colorscale-container">
        <p style="text-align: left; font-size: 16px; margin-top: -20px;"> <b>Heatmap Colorscale</b></p>
        <b-form-select v-model="selectedColor" :options="options" 
            @change="updateColorscale(selectedColor)" class="mb-3">
        </b-form-select>
    </div>
</template>

<script scoped lang="ts">
import Vue from 'vue';

import DataModel from '../../DataModel';
import * as Plotly from 'plotly.js';

export default Vue.extend({
    name: 'heatmap-options',
    data() {
        return {
            selectedColor: 'Portland',
            options: [
                { text: 'Blackbody', value: 'Blackbody' },
                { text: 'Electric', value: 'Electric' },
                { text: 'Earth', value: 'Earth' },
                { text: 'Bluered', value: 'Bluered' },
                { text: 'RdBu', value: 'RdBu' },
                { text: 'Portland', value: 'Portland' },
                { text: 'Picnic', value: 'Picnic' },
                { text: 'Jet', value: 'Jet' },
            ],
        };
    },
    methods: {
        updateColorscale(scale: any) {
            this.selectedColor = scale;
            const update = {
                colorscale: scale,
            };

            Plotly.restyle('heatmap-graph', update);
        },
    },
});
</script>

<style lang="scss" scoped>
select {
    background: dodgerblue;
    color: white;
    float: left;
    margin-left: 15px;
    padding-left: 15px;
    padding-top: 5px;
    padding-bottom: 5px;
    margin-top: -11px;
    text-align: left; 
    
}

option {
    text-align: left;
}
</style>
