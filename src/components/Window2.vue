<template>
    <div 
        ref="window" 
        class="window" 
        :style="{width:width+'px', height:height+'px', top:position.y+'px', left: position.x+'px'}"
        
        >
        <div class="header" @mousedown="dragMouseDown">
            <div class="title">{{ title }}</div>
            <div class="buttons">
                <a @click="show_modal=true">@</a>
                <a @click="is_collapsed = !is_collapsed">^</a>
                <a @click="removeWindow">x</a>
            </div>
        </div>
        <div class="body" v-show="!is_collapsed">
            <component ref="body" :id="id" :is="spec.component_type" />
        </div>
    </div>
</template>


<script lang="ts">
import Vue, { PropType } from 'vue';

import JqxWindow from 'jqwidgets-scripts/jqwidgets-vue/vue_jqxwindow.vue';
import {DataWindow, ComponentRegistration, Size, Position, Layout} from '../store/root.types';
import {throttled} from '@/Util';


export default Vue.component('ui-window2', {
    components: {},
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            is_collapsed: false,
            show_modal: false,
            watchers: Array<(() => void)>(),
            pos1: 0,
            pos2: 0,
            pos3: 0,
            pos4: 0,
        };
    },
    computed: {
        spec(): ComponentRegistration {
            return this.$store.getters.getWindowById(this.id).spec;
        },
        title(): string {
            return this.$store.getters.getWindowById(this.id).title;
        },
        settings_title(): string {
            return this.title + ' Settings';
        },
        width(): number {
            return this.$store.getters.getWindowLayout(this.id).width;
        },
        height(): number {
            return this.$store.getters.getWindowLayout(this.id).height;
        },
        position(): Position {
            return this.$store.getters.getWindowLayout(this.id).position;
        },
    },
    mounted() {
        /*console.log(this, this.$refs.window);
        this.$nextTick().then(() => {
            this.watchers.push(this.$store.watch(
                (state, getters) => {
                    return getters.getWindowLayout(this.id);
                },
                (newValue: Layout, oldValue: Layout) => {
                    //console.log(this.id, "layout watcher", this.$refs.window.$el);
                    (this.$refs.window as any).width = newValue.width;
                    (this.$refs.window as any).height = newValue.height;
                    (this.$refs.window as any).position = newValue.position;
                },
                {
                    deep: true,
                },
            ));
            this.watchers.push(this.$store.watch(
                (state, getters) => {
                    return getters.getWindowById(this.id).title;
                },
                (newValue: string, oldValue: string) => {
                    //console.log(this.id, "title watcher", this.$refs.window.$el);
                    (this.$refs.window as any).title = newValue;
                },
            ));
        });*/
        // console.log(this, this.$refs.body);
        // Create the settings button on the next tick when the DOM is ready
        this.$nextTick().then(() => {
           // console.log(this.id, "next tick", this.$refs.window.$el);
            /*const layout = this.$store.getters.getWindowLayout(this.id);
            (this.$refs.window as any).width = layout.width;
            (this.$refs.window as any).height = layout.height;
            (this.$refs.window as any).position = layout.position;*/
            // this.addSettingsButton();
        });
    },
    beforeDestroy() {
        // un-watch the store
        this.watchers.forEach((w) => w());
    },
    methods: {
        removeWindow() {
            this.$store.commit('removeWindow', this.id);
        },
        dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            this.pos3 = e.clientX;
            this.pos4 = e.clientY;
            document.onmouseup = this.closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = throttled(50, this.elementDrag);
        },
        elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            this.pos1 = this.pos3 - e.clientX;
            this.pos2 = this.pos4 - e.clientY;
            this.pos3 = e.clientX;
            this.pos4 = e.clientY;
            // set the element's new position:
            this.$store.commit('updateComponentLayout', {
                id: this.id,
                position_x: this.position.x - this.pos1,
                position_y: this.position.y - this.pos2,
            });
        },
        closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        },
        /*onResized(event: any) {
            const s = event.args as Size;
            this.$store.commit('updateComponentLayout', {
                id: this.id,
                width: s.width,
                height: s.height,
            });
        },
        onMoved(event: any) {
            const p = event.args as Position;
            this.$store.commit('updateComponentLayout', {
                id: this.id,
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
        },*/
    },
});
</script>

<style lang="scss">
/*.UiCard {
  overflow: hidden;
  border: 1px solid #dfdfdf;
  border-radius: 0.25rem;
  background-color: #fff;
}*/
.window {
    position: fixed;
    border: 1px solid #c5c5c5;
    border-radius: 0.25rem;
    background: #fff;
}
.header {
    background:#fff;
    border-bottom: 1px solid #c5c5c5;
    background: #e8e8e8;
    text-align: left;
    font-family: Verdana,Arial,sans-serif;
    font-style: normal;
    font-size: 13px;
    font-weight:400;
    line-height: 1.231;
    box-sizing: content-box;
    padding:7px;
}
.title {

}
.buttons {
    position: absolute;
    top:7px;
    right:12px;
}
.body {
    background: #fff;
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