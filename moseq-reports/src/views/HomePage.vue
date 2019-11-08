<template>
    <div class='home' :style="{height: height+'px'}">
        <b-card id="toolbox_container" no-body :style="{width: toolbox_width+'px'}">
            <b-tabs card :style="{height: height+'px'}">
                <b-tab no-body title="Data Filter">
                    <GroupBox />
                </b-tab>
                <b-tab no-body title="Toolbox">
                    <Toolbox @createComponent="addComponent" />
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

class Layout{
    position: Position;
    width: number;
    height: number;
    constructor(){
        this.width = 250;
        this.height = 300;
        this.position = new Position();
    }
}
class Position{
    x: number;
    y: number;
    constructor(){
        this.x = (Math.random() * (1000 - 300) + 300);
        this.y = (Math.random() * (500 - 100) + 100);
    }
}

class DataWindow{
    title: "default title";
    type: string;
    layout: Layout;
    constructor(type, title){
        this.type = type;
        this.title = title;
        this.layout = new Layout();
    }
}

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
            toolbox_width:250,
            windows: [],
        }
    },
    created() {
        this.debouncedResizeHandler = debounce(this.handleResize, 250);
        window.addEventListener('resize', this.debouncedResizeHandler)
    },
    destroyed() {
        window.removeEventListener('resize', this.debouncedResizeHandler)
    },
    mounted(){
        this.$nextTick().then(() => {
            this.handleResize();
        });

        this.addComponent("heat-map", "Usage heatmap");
        this.addComponent("test-syllable", "Selected Syllable");
    },
    methods:{
        addComponent(type, title){
            const win = new DataWindow(type, title);
            this.windows.push(win);
        },
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
