<template>
  <div id="app">
    <router-view/>
    <div id="bottom" style="bottom: 0;">
      <footer-bar></footer-bar>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import FooterBar from '@/components/FooterBar.vue';
import createMenuStrip from '@/MenuStrip';

import { remote } from 'electron';

export default Vue.extend({
  name: 'App',
  components: {
    'footer-bar': FooterBar,
  },
  mounted() {
    const menu = createMenuStrip();
    remote.Menu.setApplicationMenu(menu);
  },
});
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
