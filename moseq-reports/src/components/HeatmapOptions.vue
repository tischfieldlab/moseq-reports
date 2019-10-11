<template>
    <div id="colorscale-container" style="padding-top: 15px;">
      <b-card class="card-header" title="Heatmap Options">
          <b-form-group style='text-align: left;'>
            <b-card-text>
              <p class="card-title" style="margin-top: 7px;"><b>Heatmap Color Scale</b></p>
              <b-form-radio-group v-model="selected" :options='options'
                name='colorscale' style="font-size: 12px;" @change="updateColorscale($event)">
              </b-form-radio-group>
            </b-card-text>
          </b-form-group>
      </b-card>
    </div>
</template>

<script scoped lang="ts">
import Vue from 'vue';

import EventBus from '@/events/EventBus.ts';

export default Vue.extend({
    name: 'heatmap-options',
    data() {
        return {
            selected: 'Portland',
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
            const update = {
                colorscale: scale,
            };

            EventBus.$emit('updateHeatmapColorscale', update);
        },
    },
});
</script>
