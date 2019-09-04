<template>
  <div class="home" style="align-content: left; left: 0;">
    <b-container id="grid-container">
      <b-row>
        <b-col cols="3">
          <!-- This is where we populate the view with the groups -->
          <group-selection @updateGroups="selected_groups=$event"></group-selection>
        </b-col>
        <b-col cols="8">
          <!-- This is where the heatmap view will be -->
          <heatmap-module></heatmap-module>
        </b-col>
      </b-row>
      <div> {{ selected_groups }} </div>
    </b-container>
  </div>
</template>

<script>
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
      selected_groups: []
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
