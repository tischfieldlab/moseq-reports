<template>
    <div class='heatmap-outer'>
      <b-container>
        <b-row>
          <b-col>
            <div id='heatmap-graph' style="display: flex"></div>
          </b-col>
          <b-col>
            <heatmap-options></heatmap-options>
          </b-col>
        </b-row>
      </b-container>
    </div>
</template>

<script>
import HeatmapOptions from './HeatmapOptions'

import DataFrame from 'dataframe-js'
import * as Plotly from 'plotly.js-dist'

export default {
  name: 'heatmap',
  components: {
    'heatmap-options': HeatmapOptions
  },
  props: {
    dataframe: DataFrame
  },
  mounted () {
    this.createGraph()
  },
  watch: {
    dataframe (newVal, oldVal) {
      // This is where we will redraw the heatmap
      this.createGraph()
    }
  },
  methods: {
    createGraph () {
      // Get the groups
      var groups = this.dataframe.filter(row => row.get('group')).distinct('group').toArray().flat()
      var sylNum = this.dataframe.select('syllable').distinct('syllable').toArray().flat()

      // Need to format usages into groups. ie. first x amount of syllables need to be in an array; repeat for
      // number of groups. [ [...], [...] ... ]
      var sylUsage = []
      var usg = this.dataframe.select('usage').toArray()
      var index = 0
      for (var i = 0; i < sylNum.length; i++) {
        var temp = []
        for (var j = 0; j < groups.length; j++) {
          temp.push(usg[index++][0])
        }
        sylUsage.push(temp)
      }

      var data = [
        {
          x: groups,
          y: sylNum,
          z: sylUsage,
          type: 'heatmap',
          colorscale: 'Portland'
        }
      ]

      var layout = {
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
          autosize: true
        },
        yaxis: {
          showgrid: false,
          zeroline: false,
          linecolor: 'black',
          showticklabels: true,
          tick0: 0,
          dtick: '1',
          autorange: true,
          side: 'left',
          ticks: 'outside',
          autosize: true
        }
      }

      Plotly.react('heatmap-graph', data, layout)
    }
  }
}
</script>

<style scoped>
</style>
