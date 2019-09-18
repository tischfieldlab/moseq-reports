<template>
    <div id="heatmap-container">
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
import * as Plotly from 'plotly.js-dist'

import HeatmapOptions from '@/components/HeatmapOptions'
import DataModel from '@/models/DataModel'
import EventBus from '@/events/EventBus'

export default {
  name: 'heatmap',
  data () {
    return {
      dataModel: DataModel
    }
  },
  components: {
    'heatmap-options': HeatmapOptions
  },
  mounted () {
    this.createHeatmap()

    // Register events here
    EventBus.$on('updateSelectedGroups', (event) => {
      this.createHeatmap()
    })
    EventBus.$on('updateHeatmapColorscale', (event) => {
      this.updateColorscale(event)
    })
  },
  methods: {
    updateColorscale (colorscale) {
      Plotly.restyle('heatmap-graph', colorscale)
    },
    createHeatmap () {
      let df = DataModel.getView()

      var groups = df.filter(row => row.get('group')).distinct('group').toArray().flat()
      var sylNum = df.select('syllable').distinct('syllable').toArray().flat()

      var sylUsage = []
      var usg = df.select('usage').toArray()
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
