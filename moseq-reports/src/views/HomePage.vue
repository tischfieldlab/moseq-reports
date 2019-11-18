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
                    <b-button pill @click="serializeLayout">Save Layout</b-button>

                    <input type="file" ref="layout_input" @change="loadLayout($event.target.files);" style="display:none;">
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
import Heatmap from '@/components/Heatmap/Heatmap.vue';
import TestSyllable from '@/components/TestSyllable.vue';
import Toolbox from '@/components/Toolbox.vue';
import DataWindow, {IDataWindow} from '../models/DataWindow';

import {saveFile} from '../Util';
import defaultLayout from './DefaultLayout.json';


export default Vue.extend({
    name: 'homepage',
    components: {
        UiCard,
        Toolbox,
        GroupBox,
        Heatmap,
        TestSyllable,
    },
    data() {
        return {
            height: 0,
            toolbox_width: 250,
            windows: [] as DataWindow[],
            debouncedResizeHandler: function(that: Window, ev: UIEvent){},
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
        this.addComponentsJSON(defaultLayout);
    },
    methods:{
        addComponent(type: string, title: string) {
            const win = new DataWindow(type, title);
            this.windows.push(win);
            return win;
        },
        addComponentsJSON(data: IDataWindow[]) {
            for(let w of data){
                const win = DataWindow.fromJSON(w);
                this.windows.push(win);
            }
        },
        handleResize(that: Window, ev: UIEvent) {
            const header = document.getElementById('navigation-bar');
            const headerHeight = header ? header.clientHeight : 0;
            const footer = document.getElementById('bottom');
            const footerHeight = footer ? footer.clientHeight : 0;
            
            this.height = document.documentElement.clientHeight - headerHeight-footerHeight;
        },
        serializeLayout() {
            let data = JSON.stringify(this.windows);
            console.log(typeof data, data);
            saveFile("layout.json", "data:text/json", data);
        },
        loadLayout(files: FileList) {
            //if no file selected, return
            if(files === null || files.length == 0){ return; }

            //clear out any existing windows
            while (this.windows.length) { this.windows.pop(); }

            //read the file and apply the layout
            const reader = new FileReader();
            reader.onload = (e) => {
                if(e !== null && e.target !== null){
                    const data = JSON.parse(e.target.result as string) as IDataWindow[];
                    this.addComponentsJSON(data);
                }else{
                    console.warn("On load recieved null when reading selected files.");
                }
            }
            const f = files.item(0);
            if(f !== null) {
                reader.readAsText(f);
            }
        }
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
