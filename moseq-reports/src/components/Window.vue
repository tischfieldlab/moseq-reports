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
            <component ref="body" v-bind:is="component.type" />
        </div>
    </JqxWindow>
</template>


<script lang="ts">
import Vue from 'vue';
//import resize from 'vue-resize-directive'

import JqxWindow from "jqwidgets-scripts/jqwidgets-vue/vue_jqxwindow.vue";
import SettingsModal from '@/components/SettingsModal.vue';
import DataWindow from '../models/DataWindow';

export default Vue.component('ui-window', {
    components:{
        JqxWindow
    },
    props: {
        component: DataWindow,
    },
    computed: {
        
    },
    mounted(){
        //hold onto this component instance within the DataWindow
        this.component.instance = this.$refs.body;
        
        // If settings exist on the DataWindow, and the component seems to support settings,
        // then apply the settings
        if (this.component.settings !== undefined
         && this.component.instance.settings !== undefined
         && this.component.instance.settings.applySettings !== undefined){
            this.component.instance.settings.applySettings(this.component.settings);
        }

        // Create the settings button on the next tick when the DOM is ready
        this.$nextTick().then(() => {
            this.addSettingsButton();
        });
    },
    methods: {
        onResized(event){
            this.$emit('resize', event.args);
            this.component.layout.width = event.args.width;
            this.component.layout.height = event.args.height;
        },
        onMoved(event){
            this.component.layout.position.x = event.args.x;
            this.component.layout.position.y = event.args.y;
        },
        addSettingsButton(){
            //console.log("in addSettingsButton", this.$refs.body);
            const container = document.createElement('div');
            
            const modal = new SettingsModal();
            modal.$props.owner = this.$refs.body;
            modal.$mount();

            const button = document.createElement('img');
            button.src = "https://static.thenounproject.com/png/333746-200.png";
            button.classList.add("settings-button");
            button.addEventListener('click', event => {
                modal.$props.show = true;
            });
            
            container.appendChild(button);
            container.appendChild(modal.$el);
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