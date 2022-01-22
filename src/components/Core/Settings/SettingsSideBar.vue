<template>
    <div class='settings-sidebar'>
        <nav class='settings-section'>
            <p class='settings-header'>User Settings</p>
            <b-nav vertical class='settings-links'>
                <b-nav-item @click="hide">Link</b-nav-item>
                <b-nav-item href="#link-1" @click="hide">Cool Link</b-nav-item>
                <b-nav-item href="#link-2" @click="hide">Another Link</b-nav-item>
            </b-nav>
        </nav>
        <nav class='settings-section' style="padding-top: 25px;">
            <p class='settings-header'>Display Settings</p>
            <b-nav vertical class='settings-links'>
                <b-nav-item @click="hide">
                    <b-icon icon='file-person' />
                    Account
                </b-nav-item>
                <b-nav-item href="#link-1" @click="hide">Cool Link</b-nav-item>
                <b-nav-item href="#link-2" @click="hide">Another Link</b-nav-item>
            </b-nav>
        </nav>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    
})
</script>

<style lang="scss" scoped>
.settings-sidebar {
    width: 170px;
    height: 100%;
    border-right: 1px solid lightgray;
    padding-left: 10px;
}
.settings-header {
    font-weight: bold;
    margin-bottom: 0px;
}
.settings-links {
    text-align: left;
}

.nav-link {
    padding: 0;
}

.nav-link.active {
    color: darkblue;
    background-color: lightgray;
}
</style>