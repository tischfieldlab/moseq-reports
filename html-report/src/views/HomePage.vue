<template>
  <div class="home" style="align-content: left; padding-left: 20px;">
    <!-- This is where we populate the view with the groups -->
    <group-selection @updateGroups="updateSelectedGroups($event)"></group-selection>
    <!-- This is where the heatmap view will be -->
    <heatmap-module :dataframe="this.dataframe"></heatmap-module>
  </div>
</template>

<script>
import DataFrame from 'dataframe-js'
import * as meta from '../metadata/metadata'
import GroupBox from '@/components/GroupBox'
import Heatmap from '@/components/Heatmap'

export default {
  name: 'home',
  components: {
    'group-selection': GroupBox,
    'heatmap-module': Heatmap
  },
  data () {
    return {
      selected_groups: this.$root.$data.sharedState.cohortGroups,
      dataframe: new DataFrame(meta.dataframe_json.data, meta.dataframe_json.columns)
        .groupBy('syllable', 'group').aggregate(g => g.stat.mean('usage')).rename('aggregation', 'usage')
    }
  },
  methods: {
    updateSelectedGroups (groups) {
      this.selected_groups = groups

      // Reset the dataframe
      this.dataframe = new DataFrame(meta.dataframe_json.data, meta.dataframe_json.columns)
        .groupBy('syllable', 'group').aggregate(g => g.stat.mean('usage')).rename('aggregation', 'usage')

      // Get the excluded groups that were deselected in the UI
      let excludedGroups = []
      let allGroups = this.$root.$data.sharedState.cohortGroups
      for (var i = 0; i < allGroups.length; i++) {
        if (this.selected_groups.indexOf(allGroups[i]) === -1) {
          excludedGroups.push(allGroups[i])
        }
      }

      // Update the dataframe to exclude this based on this change
      for (i = 0; i < excludedGroups.length; i++) {
        this.dataframe = this.dataframe.filter(col => col.get('group') !== excludedGroups[i])
      }

      this.dataframe = this.dataframe.groupBy('syllable', 'group').aggregate(g => g.stat.mean('usage')).rename('aggregation', 'usage')
    }
  }
}
</script>

<style scoped>
.col {
  height: 100%;
  margin-top: 15px;
}
html, body {
  height: 100%;
}
</style>
