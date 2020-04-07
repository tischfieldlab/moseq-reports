<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { remote } from 'electron';

import createMainMenu from '@/MenuStrip';
import LoadData from '@/commands/LoadData';

export default Vue.extend({
    name: 'App',
    mounted() {
        const menu = createMainMenu();
        remote.Menu.setApplicationMenu(menu);

        this.watchDrop();
    },
    methods: {
        watchDrop() {
            document.ondragover = document.ondrop = this.dragEventPreventDefault;
            document.body.ondrop = this.onFileDrop;
        },
        dragEventPreventDefault(ev: DragEvent) {
            ev.preventDefault();
        },
        onFileDrop(ev: DragEvent) {
            if (ev && ev.dataTransfer) {
                if (ev.dataTransfer.files[0].path.substr(-3) === 'msq') {
                    LoadData(ev.dataTransfer.files[0].path);
                } else if (ev.dataTransfer.files[0].path.substr(-4) === 'json') {
                    console.log('looks like a layout file?');
                }
                ev.preventDefault();
            }
        },
    },
});
</script>

<style lang="scss">
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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
