<template>
    <div id="app">
        <router-view />
        <FileDropAcceptor />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { remote } from 'electron';
import createMainMenu from '@/MenuStrip';
import FileDropAcceptor from '@/components/FileDropAcceptor.vue';

export default Vue.extend({
    name: 'App',
    components: {
        FileDropAcceptor,
    },
    mounted() {
        const menu = createMainMenu();
        remote.Menu.setApplicationMenu(menu);
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
