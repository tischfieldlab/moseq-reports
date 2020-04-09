<template>
    <div class="has-no-data-container">
        <img src="/img/mouse.png" />
        <h4>
            No data loaded. Please 
            <a href="#" @click="initiateFileOpen">load some data</a> 
            by clicking File > Open File.
        </h4>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import loadDataCommand from '@/commands/LoadData';


export default Vue.extend({
    methods: {
        initiateFileOpen(): void {
            loadDataCommand();
        },
    },
});
</script>

<style scoped>
.has-no-data-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: inherit;
}
.has-no-data-container img {
    opacity: 0.2;
    margin-top: -10%;
}
.has-no-data-container h4 {
    margin-top: -80px;
}
</style>