<template>
    <JqxWindow ref="window" 
        @resized="onResized($event)"
        @moved="onMoved($event)"
        :showCollapseButton="true"
        :width="data_component.layout.width"
        :height="data_component.layout.height"
        :position="data_component.layout.position">
        <div>
            <span class="title-text">{{data_component.title}}</span>
        </div>
        <div>
            <component ref="body" :id="data_component.id" :is="data_component.spec.component_type" />
            <b-modal
                :title="settings_title"
                v-model="show_modal"
                header-bg-variant="dark"
                header-text-variant="light"
                body-bg-variant="light"
                body-text-variant="dark"
                hide-footer>
                
                <component v-if="data_component.spec.settings_type" ref="modal_component" :id="data_component.id" :is="data_component.spec.settings_type" />
                <p v-else>No settings available for this component</p>

            </b-modal>
        </div>
    </JqxWindow>
</template>


<script lang="ts">
import Vue, { PropType } from 'vue';

import JqxWindow from 'jqwidgets-scripts/jqwidgets-vue/vue_jqxwindow.vue';
import {DataWindow, Size, Position, Layout} from '../store/root.types';


export default Vue.component('ui-window', {
    components: {
        JqxWindow,
    },
    props: {
        data_component: {
            type: Object as PropType<DataWindow>,
            required: true,
        },
    },
    data() {
        return {
            show_modal: false,
        };
    },
    computed: {
        settings_title(): string {
            return this.data_component.title + ' Settings';
        },
    },
    mounted() {
        // console.log(this, this.$refs.body);
        // Create the settings button on the next tick when the DOM is ready
        this.$nextTick().then(() => {
            this.addSettingsButton();
        });
    },
    methods: {
        onResized(event: any) {
            const s = event.args as Size;
            this.$store.commit('updateLayout', {
                id: this.data_component.id,
                width: s.width,
                height: s.height,
            });
        },
        onMoved(event: any) {
            const p = event.args as Position;
            this.$store.commit('updateLayout', {
                id: this.data_component.id,
                position_x: p.x,
                position_y: p.y,
            });
        },
        addSettingsButton() {
            const container = document.createElement('div');

            const button = document.createElement('img');
            button.src = 'https://static.thenounproject.com/png/333746-200.png';
            button.classList.add('settings-button');
            button.addEventListener('click', (event) => {
                this.show_modal = true;
            });

            container.appendChild(button);
            this.$el.children[0].children[0].appendChild(container);
        },
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