<template>
    <div class='home' :style="{height: height+'px'}">
        <b-card id="toolbox_container" no-body :style="{width: toolbox_width+'px', height: height+'px'}">
            <!--<b-tabs card :style="{}">
                <b-tab no-body title="Data">-->
                    <GroupBox />
                <!--</b-tab>
                <b-tab no-body title="Tools">
                    <Toolbox @createComponent="addComponent" />
                </b-tab>
                <b-tab no-body title="View">
                    <b-button pill @click="$store.commit('clearLayout')">Clear Layout</b-button>
                    <b-button pill @click="$store.dispatch('loadDefaultLayout')">Default Layout</b-button>
                    <b-button pill @click="$store.dispatch('serializeLayout')">Save Layout</b-button>

                    <input type="file" ref="layout_input" @change="$store.dispatch('loadLayoutFromFile', $event.target.files);$refs.layout_input.value='';" style="display:none;">
                    <b-button pill @click="$refs.layout_input.click()">Load Layout</b-button>
                </b-tab>
            </b-tabs>-->
        </b-card>
        <div id="has-no-metadata-container" :style="{'left': toolbox_width+'px', 'width': width+'px', 'top': height/2+'px'}" v-if="!metadataLoaded">
            <h4 style="text-align: center;" id="no-data-text">
                No data loaded. Please <a href="#" @click="initiateFileOpen">load some data</a> by clicking File > Open File.
            </h4>
        </div>
        <template v-for="w in windows">
            <UiCard :key="w.id" :id="w.id" />
            <!--<UiCard2 :key="w.id" :id="w.id" />-->
        </template>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { debounce } from 'ts-debounce';

import UiCard from '@/components/Window.vue';
import UiCard2 from '@/components/Window2.vue';
import GroupBox from '@/components/GroupBox.vue';
import Toolbox from '@/components/Toolbox.vue';

import { DataWindow } from '@/store/root.types';
import { openNewFileButton } from '@/MenuStrip';


export default Vue.component('homepage', {
    name: 'homepage',
    components: {
        UiCard,
        UiCard2,
        Toolbox,
        GroupBox,
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
        windows(): DataWindow[] {
            return this.$store.state.windows;
        },
        metadataLoaded(): boolean {
            return this.$store.getters['dataview/view'] !== null;
        },
    },
    watch: {
        metadataLoaded: {
            handler(newState, oldState) {
                if (!oldState && newState && this.windows.length === 0) {
                    this.loadDefaultLayout();
                }
            },
            deep: true,
        },
    },
    created() {
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
            this.$store.dispatch('loadDefaultLayout');
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
.tabs{
    height:100%;
}
#toolbox_container{
    height:100%;
    border-radius:0;
}
#toolbox_container .tabs{
    overflow: auto;
}
#has-no-metadata-container{
    position: fixed;
    top: 0px;
    padding-right: 40px;
}
</style>
