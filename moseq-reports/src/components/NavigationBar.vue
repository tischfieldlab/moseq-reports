<template>
    <div id="navigation-bar">
        <div class="contianer">
            <b-navbar toggleable="lg" type="dark" variant="dark">
                <b-navbar-nav class="nav-text">
                    <b-navbar-brand href="/">Data Report</b-navbar-brand>
                    <b-nav-item href="/" right>Home</b-nav-item>
                    <b-nav-item href="/data" right>Data</b-nav-item>
                    <b-nav-item href="/options" left>Options</b-nav-item>
                </b-navbar-nav>
            </b-navbar>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'NavBar',
});
</script>

<style scoped lang="scss">
</style>
