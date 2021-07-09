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
    import {ComponentRegistration} from '../store/root.types';
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
                // document.onmousemove = throttled(50, this.elementDrag);
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
                    // position_x: this.position.x - this.pos1,
                    // position_y: this.position.y - this.pos2,
                });
            },
            closeDragElement() {
                document.onmouseup = null;
                document.onmousemove = null;
            },
        },
    });
</script>

<style lang="scss">
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
