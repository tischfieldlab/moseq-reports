<template>
  <div class="home">
    <b-container id="grid-container">
      <b-row>
        <b-col cols="3">
          <!-- This is where we populate the view with the
            groups -->
          <group-selection></group-selection>
        </b-col>
        <b-col cols="8">This is where the heatmap will go. This is a separate component.</b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import GroupBox from './GroupBox'

export default {
  name: 'home',
  components: {
    'group-selection': GroupBox
  }
}
</script>

<style scoped>
.col {
  height: 100px;
  margin-top: 15px;
}
</style>
