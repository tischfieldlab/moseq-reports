<template>
    <div class='data'>
        Hello data
    </div>
</template>

<script>
import * as meta from '@/metadata/metadata.js'
import DataFrame from 'dataframe-js'

const data = meta.dataframe_json.data
const cols = meta.dataframe_json.columns

// eslint-disable-next-line
let df = new DataFrame(data, cols)
df = df.groupBy('syllable', 'group').aggregate(g => g.stat.mean('usage')).rename('aggregation', 'usage')

export default {
  name: 'data',
  data () {
    return {
      'dataframe': df
    }
  }
}
</script>

<style scoped>
</style>
