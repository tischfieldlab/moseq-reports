<template>
    <div class='home'>
        <b-container fluid style="margin-top: 10px;" class="bv-example-row">
            <b-row>
                <b-col md="auto">
                    <group-box></group-box>
                    <b-button @click="addHeatmap($event)">Add Heatmap</b-button>
                </b-col>
                <b-col>
                    <JqxDocking ref="docking" orientation="docking.orientation" width="docking.width" mode="docking.mode">
                        <div>
                            <template v-for="(w, index) in windows">
                                <UiCard :key="index" :id="`data-window-${index}`">
                                    <div slot="header">
                                        <span class="title-text">{{w.title}}</span>
                                        <img style="float:right;" width="24" height="24" src="https://static.thenounproject.com/png/333746-200.png" />
                                    </div>
                                    <component slot="body" v-bind:is="w.type" />
                                </UiCard>
                            </template>
                        </div>
                    </JqxDocking>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import UiCard from '@/components/Window.vue';

import JqxDocking from "jqwidgets-scripts/jqwidgets-vue/vue_jqxdocking.vue";
import JqxDockingLayout from "jqwidgets-scripts/jqwidgets-vue/vue_jqxdockinglayout.vue";

import GroupBox from '@/components/GroupBox.vue';
import Heatmap from '@/components/Heatmap/Heatmap.vue';
import TestSyllable from '@/components/TestSyllable.vue';

class DataWindow{
    title: "default title";
    content: "default content";
    type: string;
    constructor(type, title){
        this.type = type;
        this.title = title;
    }
}

export default Vue.extend({
    name: 'homepage',
    components: {
        JqxDocking,
        UiCard,
        'group-box': GroupBox,
        'heat-map': Heatmap,
        'test-syllable': TestSyllable,
    },
    data() {
        return {
            windows: [],
            docking: {
                orientation: 'horizontal',
                width: "100%",
                mode:"floating"
            }
        }
    },
    mounted(){
        this.docking.width = this.$parent.$el.offsetWidth;
        this.addComponent("heat-map", "A heat map");
    },
    methods:{
        addComponent(type, title){
            this.windows.push(new DataWindow(type, title));
            let winname = "data-window-"+(this.windows.length-1);

            this.$nextTick().then(() => {
                this.$refs.docking.addWindow(winname, this.docking.mode, 0, 1);
            });
        },
        addHeatmap(e){
            this.addComponent("heat-map", "A heat map");
        },
    },
});
</script>

<style scoped lang="scss">

</style>
