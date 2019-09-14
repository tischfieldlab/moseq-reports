<template>
    <div id='homepage-container' style='align-content: left; padding-left: 20px;'>
      <groupbox-component></groupbox-component>
      <heatmap-component></heatmap-component>
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
}
</script>

<style scoped>
</style>
