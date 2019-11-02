<template>
    <div class='home' >
        <JqxDockingLayout ref="dockinglayout" :width="'100%'" :height="'100%'" :layout="layout">
            <div data-container="DataFilterPanel">
                <div id="data-filter-container"></div>
            </div>
            <div data-container="ToolboxPanel">
                <div id="toolbox-container"></div>
            </div>
            
                
            <template v-for="(w, index) in windows">
                <UiCard :key="index" :component="w" />
            </template>
        </JqxDockingLayout>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import UiCard from '@/components/Window.vue';

import JqxDockingLayout from "jqwidgets-scripts/jqwidgets-vue/vue_jqxdockinglayout.vue";

import GroupBox from '@/components/GroupBox.vue';
import Heatmap from '@/components/Heatmap/Heatmap.vue';
import TestSyllable from '@/components/TestSyllable.vue';
import Toolbox from '@/components/Toolbox.vue';

class DataWindow{
    title: "default title";
    type: string;
    instance: any;
    constructor(type, title){
        this.type = type;
        this.title = title;
    }
}

export default Vue.extend({
    name: 'homepage',
    components: {
        JqxDockingLayout,
        UiCard,
        Toolbox,
        'group-box': GroupBox,
        'heat-map': Heatmap,
        'test-syllable': TestSyllable,
    },
    data() {
        return {
            height: 0,
            windows: [],
            docking: {
                orientation: 'horizontal',
                width: "100%",
                mode:"floating",
            },
            layout: [{
                type: 'layoutGroup',
                orientation: 'horizontal',
                items: [{
                    type:'tabbedGroup',
                    width:300,
                    items:[{
                        type: 'layoutPanel',
                        title: 'Data Filter',
                        contentContainer: 'DataFilterPanel',
                        allowClose:false,
                        initContent: () => {
                            var ComponentClass = Vue.extend(GroupBox);
                            var instance = new ComponentClass();
                            instance.$mount();
                            document.getElementById('data-filter-container').appendChild(instance.$el);
                        }
                    },{
                        type: 'layoutPanel',
                        title: 'Toolbox',
                        contentContainer: 'ToolboxPanel',
                        allowClose:false,
                        initContent: () => {
                            var ComponentClass = Vue.extend(Toolbox);
                            var instance = new ComponentClass({
                                propsData: { add_component: this.addComponent }
                            });
                            instance.$mount();
                            document.getElementById('toolbox-container').appendChild(instance.$el);
                        }
                    }],
                },]
            }],
        }
    },
    created() {
        window.addEventListener('resize', this.handleResize)
    },
    destroyed() {
        window.removeEventListener('resize', this.handleResize)
    },
    mounted(){
        
        this.docking.width = this.$parent.$el.offsetWidth;
        this.addComponent("heat-map", "A heat map");
        this.$nextTick().then(() => {
            this.handleResize();
        });
    },
    methods:{
        addComponent(type, title){
            console.log("in add component", type, title);
            const win = new DataWindow(type, title);
            this.windows.push(win);
            //let winname = "data-window-"+(this.windows.length-1);

            this.$nextTick().then(() => {
                //this.$refs.docking.addWindow(winname, this.docking.mode, 0, 1);
            });
        },
        addHeatmap(e){
            this.addComponent("heat-map", "A heat map");
        },
        handleResize() {
            const header = document.getElementById('navigation-bar');
            const headerHeight = header ? header.clientHeight : 0;
            const footer = document.getElementById('bottom');
            const footerHeight = footer ? footer.clientHeight : 0;
            
            this.height = document.documentElement.clientHeight - headerHeight-footerHeight;
            this.$refs.dockinglayout.height = this.height;
            //console.log("in resize", this.height, document.documentElement.clientHeight, headerHeight, footerHeight)
        },
    },
});
</script>

<style scoped lang="scss">

</style>
