<template>
    <div>
        <b-button pill @click="add_component('heat-map', 'A heat map');">Add Heatmap 1</b-button>
        <b-button pill @click="add_component('heat-map', 'A heat map');">Add Heatmap 2</b-button>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
export default Vue.component('tool-box', {
    props:{
        add_component: null,
    }
})
</script>

<style scoped lang="scss">
.btn{
    margin:10px;
}
</style>