<template>
    <JqxWindow ref="window" @resized="onResize($event)" :showCollapseButton="true">
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
import DataWindow from '@/views/HomePage.vue';

export default Vue.component('ui-window', {
    components:{
        JqxWindow
    },
    props: {
        component: DataWindow,
    },
    methods: {
        onResize(event){
            //console.log("I got resized", event);
            this.$emit('resize', event.args);
        },
        addSettingsButton(){
            const container = document.createElement('div');
            
            const modal = new SettingsModal();
            console.log(this.$refs.body)
            modal.$props.content = this.$refs.body.settings;
            modal.$mount();
            //console.log(this) 
            modal.$el.classList.add('hidden');
            modal.$on('close', ()=>{
                //console.log("got close");
                modal.$el.classList.add('hidden');
            });

            const button = document.createElement('img');
            button.src = "https://static.thenounproject.com/png/333746-200.png";
            button.classList.add("settings-button");
            button.addEventListener('click', event => {
                modal.$el.classList.toggle('hidden');
            });
            
            container.appendChild(button);
            container.appendChild(modal.$el);
            this.$el.children[0].children[0].appendChild(container);
        }
    },
    mounted(){
        //console.log(this);

        this.$nextTick().then(() => {
            this.addSettingsButton();
        });
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
}
</style>