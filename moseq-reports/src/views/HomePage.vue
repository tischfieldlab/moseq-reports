<template>
    <div class='home' :style="{height: height+'px'}">
        <b-card id="toolbox_container" no-body :style="{width: toolbox_width+'px'}">
            <b-tabs card :style="{height: height+'px'}">
                <b-tab no-body title="Data">
                    <GroupBox />
                </b-tab>
                <b-tab no-body title="Tools">
                    <Toolbox @createComponent="addComponent" />
                </b-tab>
                <b-tab no-body title="View">
                    <b-button pill @click="$store.dispatch('serializeLayout')">Save Layout</b-button>

                    <input type="file" ref="layout_input" @change="$store.dispatch('loadLayout', $event.target.files);" style="display:none;">
                    <b-button pill @click="$refs.layout_input.click()">Load Layout</b-button>
                </b-tab>
            </b-tabs>
        </b-card>
        <template v-for="(w, index) in windows">
            <UiCard :key="index" :component="w" />
        </template>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { debounce } from 'ts-debounce';

import UiCard from '@/components/Window.vue';

import GroupBox from '@/components/GroupBox.vue';
import Toolbox from '@/components/Toolbox.vue';
import store from '../store/root.store';
import {DataWindow} from '../store/root.types';

import {saveFile} from '../Util';
import defaultLayout from './DefaultLayout.json';

interface ModalPayload{
    title: string,
    type: string,
    id: number,
    show: boolean,
}


export default Vue.component('homepage', {
    name: 'homepage',
    components: {
        UiCard,
        Toolbox,
        GroupBox,
    },
    data() {
        return {
            height: 0,
            toolbox_width: 250,
            debouncedResizeHandler: function(that: Window, ev: UIEvent){},
        }
    },
    computed: {
        windows(){
            return store.state.windows;
        }
    },
    created() {
        this.debouncedResizeHandler = debounce(this.handleResize, 250);
        window.addEventListener('resize', this.debouncedResizeHandler)
    },
    destroyed() {
        window.removeEventListener('resize', this.debouncedResizeHandler)
    },
    mounted() {
        this.$nextTick().then(() => {
            this.handleResize();
        });
    },
    methods: {
        handleResize() {
            const header = document.getElementById('navigation-bar');
            const headerHeight = header ? header.clientHeight : 0;
            const footer = document.getElementById('bottom');
            const footerHeight = footer ? footer.clientHeight : 0;
            
            this.height = document.documentElement.clientHeight - headerHeight-footerHeight;
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

</style>
