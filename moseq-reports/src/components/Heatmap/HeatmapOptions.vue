<template>
    <b-form-group
        label="Heatmap Colorscale"
        label-for="heat-color"
    >
        <b-form-select 
            id="heat-color" 
            v-model="selectedColor" 
            :options="options" 
            @change="updateColorscale(selectedColor)" class="mb-3">
        </b-form-select>
    </b-form-group>
</template>

<script scoped lang="ts">
import Vue from 'vue';

import DataModel from '@/models/DataModel';
import * as Plotly from 'plotly.js';
import Heatmap from '@/components/Heatmap/Heatmap.vue';

export default Vue.extend({
    name: 'heatmap-options',
    props:{
        owner: Heatmap,
    },
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

            Plotly.restyle(this.owner.$refs['heatmap-graph'], update);
        },
        getSettings(){
            return {
                color_scale: this.selectedColor
            }
        },
        applySettings(data){
            this.updateColorscale(data.color_scale);
        }
    },
});
</script>

<style lang="scss" scoped>

</style>
