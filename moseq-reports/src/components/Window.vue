<template>
    <JqxWindow ref="window" 
        @resized="onResized($event)"
        @moved="onMoved($event)"
        :showCollapseButton="true"
        :width="component.layout.width"
        :height="component.layout.height"
        :position="component.layout.position">
        <div>
            <span class="title-text">{{component.title}}</span>
        </div>
        <div>
            <component ref="body" :id="component.id" :is="component.type" />
            <b-modal
                :title="settings_title"
                v-model="show_modal"
                header-bg-variant="dark"
                header-text-variant="light"
                body-bg-variant="light"
                body-text-variant="dark"
                hide-footer>
                
                <component v-if="settings_type" ref="modal_component" :id="component.id" :is="component.spec.settings_type" />
                <p v-else>No settings available for this component</p>

            </b-modal>
        </div>
    </JqxWindow>
</template>


<script lang="ts">
import Vue from 'vue';
//import resize from 'vue-resize-directive'

import JqxWindow from "jqwidgets-scripts/jqwidgets-vue/vue_jqxwindow.vue";
import {DataWindow, Size, Position, Layout} from '../store/root.types';
import store from '../store/root.store';

export default Vue.component('ui-window', {
    components:{
        JqxWindow,
    },
    props: {
        component: {
            type: Object,
            required: true
        },
    },
    data() {
        return {
            show_modal: false,
        }
    },
    computed: {
        settings_title() {
            return this.component.title + " Settings";
        },
    },
    mounted(){
        // Create the settings button on the next tick when the DOM is ready
        this.$nextTick().then(() => {
            this.addSettingsButton();
        });
    },
    methods: {
        onResized(event: any){
            const s = event.args as Size;
            store.commit('updateLayout', {
                id: this.component.id,
                width: s.width,
                height: s.height,
            });
        },
        onMoved(event: any){
            const p = event.args as Position;
            store.commit('updateLayout', {
                id: this.component.id,
                position_x: p.x,
                position_y: p.y,
            });
        },
        addSettingsButton(){
            //console.log("in addSettingsButton", this.$refs.body);
            const container = document.createElement('div');

            const button = document.createElement('img');
            button.src = "https://static.thenounproject.com/png/333746-200.png";
            button.classList.add("settings-button");
            button.addEventListener('click', event => {
                this.show_modal = true;
            });
            
            container.appendChild(button);
            this.$el.children[0].children[0].appendChild(container);
        }
    },
    
});

</script>
<style lang="scss">
.UiCard {
  overflow: hidden;
  border: 1px solid #dfdfdf;
  border-radius: 0.25rem;
  background-color: #fff;
}

.UiCard__body {
  padding: 1em;
}

.hidden{
    display:none !important;
}

.settings-button{
    width: 16px; 
    height: 16px; 
    margin-right: 7px; 
    margin-left: 0px; 
    position: absolute; 
    right: 32px;
    cursor:pointer;
    //background: url(https://static.thenounproject.com/png/333746-200.png);
}
</style>