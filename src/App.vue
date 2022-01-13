<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'App',
});
</script>

<style lang="scss">

#app {
    font-family: var(--font-family);
    -webkit-font-smoothing: var(--webkit-font-smoothing);
    -moz-osx-font-smoothing: var(--webkit-font-smoothing);
    color: var(--color);
}
// #nav {
//     padding: 30px;
//     a {
//         font-weight: bold;
//         color: #2c3e50;
//         &.router-link-exact-active {
//         color: #42b983;
//         }
//     }
// }
</style>
