<template>
    <div class="home" :style="{height: `${height}px`}">
        <div v-show="metadataLoaded" id="filter_container" :style="{width: `${toolbox_width}px`, height: `${height}px`}">
            <h3>Data Filters</h3>
            <div ref="tbx_wrapper">
                <template v-for="ns in $store.state.filters.items">
                    <DataFilter :key="ns" :dataview="ns" />
                </template>
            </div>
        </div>
        <div id="has-no-metadata-container" :style="{'left': toolbox_width+'px', 'width': width+'px', 'top': height/2+'px'}" v-if="!metadataLoaded">
            <h4 style="text-align: center;" id="no-data-text">
                No data loaded. Please <a href="#" @click="initiateFileOpen">load some data</a> by clicking File > Open File.
            </h4>
        </div>
        <template v-for="wid in windows">
            <UiCard :key="wid" :id="wid" />
        </template>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { debounce } from 'ts-debounce';

import UiCard from '@/components/Window.vue';
import DataFilter from '@/components/DataFilter.vue';

import { openNewFileButton } from '@/MenuStrip';


export default Vue.component('homepage', {
    name: 'homepage',
    components: {
        UiCard,
        DataFilter,
    },
    data() {
        return {
            noDataMessage: 'No data loaded. Please load some data by clicking File > Open File.',
            height: 0,
            width: 0,
            toolbox_width: 250,
            debouncedResizeHandler(this: Window, ev: UIEvent): any { return; },
        };
    },
    computed: {
        windows(): string[] {
            return this.$store.state.datawindows.items;
        },
        metadataLoaded(): boolean {
            return this.$store.state.datasets.usageByUsage !== null;
        },
    },
    watch: {
        metadataLoaded: {
            handler(newState, oldState) {
                if (!oldState && newState && this.windows.length === 0) {
                    this.$nextTick().then(() => this.loadDefaultLayout());
                }
            },
            deep: true,
        },
    },
    created() {
        this.$store.dispatch('filters/addFilter');
        this.debouncedResizeHandler = debounce(this.handleResize, 250);
        window.addEventListener('resize', this.debouncedResizeHandler);
    },
    destroyed() {
        window.removeEventListener('resize', this.debouncedResizeHandler);
    },
    mounted() {
        this.$nextTick().then(() => {
            this.handleResize();
        });
    },
    methods: {
        handleResize(): any {
            this.height = document.documentElement.clientHeight;
            this.width = document.documentElement.clientWidth - this.toolbox_width;
        },
        loadDefaultLayout(): void {
            this.$store.dispatch('datawindows/loadDefaultLayout');
        },
        initiateFileOpen(): void {
            openNewFileButton();
        },
    },
});
</script>

<style scoped lang="scss">
.home{
    background-color:#e9ecef ;
}
#filter_container {
    display: flex;
    flex-flow: column;
    height: 100%;
}
#filter_container > h3 {
    background: #c5c5c5;
    padding: 10px;
    margin-bottom: 0;
    font-size: 1.5em;
}
#filter_container > div {
    flex-grow : 1;
    overflow-y: auto;
    overflow-x: hidden;
}

#has-no-metadata-container{
    position: fixed;
    top: 0px;
    padding-right: 40px;
}
</style>
