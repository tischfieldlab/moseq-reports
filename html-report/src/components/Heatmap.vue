<template>
    <div class='heatmap-outer'>
        <div id='heatmap-graph'></div>
    </div>
</template>

<script>
import DataFrame from 'dataframe-js'
import * as Plotly from 'plotly.js-dist'

export default {
  name: 'heatmap',
  data () {
    return {
    }
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
      var groups = this.dataframe.filter(row => row.get('group')).distinct('group').toArray()
      var sylNum = this.dataframe.select('syllable').distinct('syllable').toArray()

      // Need to format usages into groups. ie. first x amount of syllables need to be in an array; repeat for
      // number of groups. [ [...], [...] ... ]
      var sylUsage = []
      var usg = this.dataframe.select('usage').toArray()
      var index = 0
      for (var i = 0; i < groups.length; i++) {
        var temp = []
        for (var j = 0; j < sylNum.length; j++) {
          temp.push(usg[index++][0])
        }
        sylUsage.push(temp)
      }
      // TODO: Make the formatting a lot cleaner and convert over to D3
      var data = [
        {
          x: groups,
          y: sylNum,
          z: sylUsage,
          type: 'heatmap'
        }
      ]
      var layout = {
        title: 'Syllable Usage Heatmap',
        xaxis: {
          ticks: '',
          side: 'left',
          showgrid: false
        },
        yaxis: {
          ticks: 'bottom',
          ticksuffix: ' ',
          width: 700,
          height: 700,
          autosize: false,
          showgrid: false
        }
      }

      Plotly.newPlot('heatmap-graph', data, layout)
    }
  }
}
</script>

<style scoped>
</style>
