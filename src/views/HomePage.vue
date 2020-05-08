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
import {UpdateTitle} from '@/WindowChrome';


export default Vue.component('homepage', {
    name: 'homepage',
    components: {
        WindowContainer,
        DataFilterContainer,
        NoDataPresent,
        FileDropAcceptor,
    },
    computed: {
        title() {
            let title = 'Moseq Reports';
            const currFile = this.$store.state.datasets.name;
            if (currFile) {
                title += ' - ' + currFile;
            }
            return title;
        },
        metadataLoaded(): boolean {
            return this.$store.state.datasets.usageByUsage !== null;
        },
    },
    watch: {
        title: {
            handler() {
                UpdateTitle(this.title);
            },
            immediate: true,
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
