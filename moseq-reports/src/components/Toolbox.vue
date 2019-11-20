<template>
    <div>
        <template v-for="(c, index) in this.available_components">
            <b-button pill :key="index" @click="create_component(c);">Add {{ c.friendly_name }}</b-button>
        </template>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import store from '../store/root.store';
import {createDataWindow, ComponentRegistration} from '../store/root.types';

export default Vue.component('tool-box', {

    computed: {
        available_components(): ComponentRegistration[] {
            return this.$store.state.registry;
        },
    },
    methods:{
        create_component: function(component_info: ComponentRegistration) {
            const win = createDataWindow(component_info);
            store.commit('addWindow', win);
        }
    }
})
</script>

<style scoped lang="scss">
.btn{
    margin:10px;
}
</style>