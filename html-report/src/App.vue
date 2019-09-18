<template>
  <div id="app">
    <nav-bar></nav-bar>
    <router-view></router-view>
    <footer-bar></footer-bar>
  </div>
</template>

<script>
import NavigationBar from './components/NavigationBar'
import FooterBar from './components/FooterBar'

import DataModel from '@/models/DataModel'

export default {
  name: 'App',
  components: {
    'nav-bar': NavigationBar,
    'footer-bar': FooterBar
  },
  created () {
    DataModel.loadDataframe()
    DataModel.loadAvailableGroups()
    DataModel.getAvailableGroups()
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
