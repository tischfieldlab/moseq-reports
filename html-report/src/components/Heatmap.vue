<template>
    <div class="heatmap-container">
        <div id='heatmap-graph'></div>
    </div>
</template>

<script>
import Plotly from 'plotly.js-dist'

var data = [
  {
    z: [[1, 20, 30], [20, 1, 60], [30, 60, 1]],
    type: 'heatmap'
  }
]

Plotly.newPlot('heatmap-graph', data)

export default {
  name: 'heatmap',
  data () {
    return {
      data: [
        {
          z: [[1, 20, 30], [20, 1, 60], [30, 60, 1]],
          type: 'heatmap'
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
