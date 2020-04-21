<template>
    <div class="home">
        <DataFilterContainer :right="false" v-show="metadataLoaded" />
        <NoDataPresent />
        <WindowContainer />
        <FileDropAcceptor />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import DataFilterContainer from '@/components/DataFilterContainer.vue';
import WindowContainer from '@/components/WindowContainer.vue';
import NoDataPresent from '@/components/NoDataPresent.vue';
import FileDropAcceptor from '@/components/FileDropAcceptor.vue';



export default Vue.component('homepage', {
    name: 'homepage',
    components: {
        WindowContainer,
        DataFilterContainer,
        NoDataPresent,
        FileDropAcceptor,
    },
    computed: {
        metadataLoaded(): boolean {
            return this.$store.state.datasets.usageByUsage !== null;
        },
    },
});
</script>

<style scoped lang="scss">
.home{
    background-color:#e9ecef;
    height: 100%;
    width: 100%;
    position: fixed;
}
</style>
