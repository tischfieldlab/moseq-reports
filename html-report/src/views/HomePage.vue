<template>
    <div id='homepage-container' style='align-content: left; padding-left: 20px;'>
      <groupbox-component @updateGroupSelection="updateSelectedGroups($event)" :dataModel="this.dataModel"></groupbox-component>
      <heatmap-component :viewDf="this.viewDf"></heatmap-component>
    </div>
</template>

<script>
import GroupBox from '@/components/GroupBox'
import Heatmap from '@/components/Heatmap'

export default {
  name: 'homepage',
  components: {
    'groupbox-component': GroupBox,
    'heatmap-component': Heatmap
  },
  data () {
    return {
      dataModel: this.$root.$data.dataModel,
      viewDf: this.$root.$data.dataModel.getView()
    }
  },
  methods: {
    updateSelectedGroups (event) {
      this.dataModel = this.$root.$data.dataModel
      this.viewDf = this.$root.$data.dataModel.getView()
    }
  }
}
</script>

<style scoped>
</style>
