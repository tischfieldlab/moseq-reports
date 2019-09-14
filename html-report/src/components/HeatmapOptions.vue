<template>
    <div id="colorscale-container" style="padding-top: 15px;">
      <b-card class="card-header" title="Heatmap Options">
          <b-form-group style='text-align: left;'>
            <b-card-text>
              <p class="card-title" style="margin-top: 7px;"><b>Heatmap Color Scale</b></p>
              <b-form-radio-group v-model="selected" :options='options'
                name='colorscale' style="font-size: 13px;" @change="updateColorscale($event)">
              </b-form-radio-group>
            </b-card-text>
          </b-form-group>
      </b-card>
    </div>
</template>

<script>
import * as Plotly from 'plotly.js-dist'
export default {
  data () {
    return {
      selected: 'Portland',
      options: [
        { text: 'Blackbody', value: 'Blackbody' },
        { text: 'Electric', value: 'Electric' },
        { text: 'Earth', value: 'Earth' },
        { text: 'Bluered', value: 'Bluered' },
        { text: 'YIOrRd', value: 'YIOrRd' },
        { text: 'YIGnBu', value: 'YIGnBu' },
        { text: 'RdBu', value: 'RdBu' },
        { text: 'Portland', value: 'Portland' },
        { text: 'Picnic', value: 'Picnic' },
        { text: 'Jet', value: 'Jet' }
      ]
    }
  },
  methods: {
    updateColorscale (scale) {
      var update = {
        colorscale: scale
      }
      Plotly.restyle('heatmap-graph', update)
    }
  }
}
</script>

<style scoped>
</style>
