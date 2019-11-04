<template>
    <div>
        <b-button pill @click="create_component('heat-map', 'Usage heatmap');">Add Heatmap 1</b-button>
        <b-button pill @click="create_component('heat-map', 'Usage heatmap');">Add Heatmap 2</b-button>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
export default Vue.component('tool-box', {
    props:{
        
    },
    mounted(){
        
    },
    methods:{
        create_component: function(type:string, title:string) {
            this.$emit('createComponent', type, title);
        }
    }
})
</script>

<style scoped lang="scss">
.btn{
    margin:10px;
}
</style>