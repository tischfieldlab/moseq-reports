<template>
    <JqxWindow ref="window" 
        @resized="onResized($event)"
        @moved="onMoved($event)"
        @close="onClosed($event)"
        :width="width"
        :height="height"
        :position="position"
        :showCollapseButton="true">
        <div>
            {{ title }}
        </div>
        <div>
            <component ref="body" :id="id" :is="spec.component_type" />
            <b-modal
                :title="settings_title"
                v-model="show_modal"
                header-bg-variant="dark"
                header-text-variant="light"
                body-bg-variant="light"
                body-text-variant="dark"
                hide-footer>

                <b-tabs>
                    <b-tab title="Layout">
                        <LayoutSettings :id="id" />
                    </b-tab>
                    <b-tab title="Data">
                        <DataSettings :id="id" />
                    </b-tab>
                    <b-tab title="Component">
                        <component v-if="spec.settings_type" ref="modal_component" :id="id" :is="spec.settings_type" />
                        <p v-else class="no-settings text-muted">No settings available for this component</p>
                    </b-tab>
                </b-tabs>

            </b-modal>
        </div>
    </JqxWindow>
</template>


<script lang="ts">
import Vue, { PropType } from 'vue';

import JqxWindow from 'jqwidgets-scripts/jqwidgets-vue/vue_jqxwindow.vue';
import {DataWindow, ComponentRegistration, Size, Position, Layout} from '../store/root.types';
import { toPng, toCanvas } from 'html-to-image';
import { saveAs } from 'file-saver';
import {saveSvgAsPng} from 'save-svg-as-png';


export default Vue.component('ui-window', {
    components: {
        JqxWindow,
    },
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            show_modal: false,
            watchers: Array<(() => void)>(),
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
        position(): number {
            return this.$store.getters.getWindowLayout(this.id).position;
        },
    },
    mounted() {
        this.watchers.push(this.$store.watch(
            (state, getters) => {
                return getters.getWindowLayout(this.id);
            },
            (newValue: Layout, oldValue: Layout) => {
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
                (this.$refs.window as any).title = newValue;
            },
        ));

        // Create the settings button on the next tick when the DOM is ready
        this.$nextTick().then(() => {
            this.addSettingsButton();
        });
    },
    beforeDestroy() {
        // un-watch the store
        this.watchers.forEach((w) => w());
    },
    methods: {
        onResized(event: any) {
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
        onClosed(event: any) {
            this.$store.commit('removeWindow', this.id);
        },
        addSettingsButton() {
            const container = document.createElement('div');

            const settingsButton = document.createElement('img');
            settingsButton.src = 'https://static.thenounproject.com/png/333746-200.png';
            settingsButton.classList.add('settings-button');
            settingsButton.addEventListener('click', (event) => {
                this.show_modal = true;
            });

            container.appendChild(settingsButton);
            this.$el.children[0].children[0].appendChild(container);

            const snapButton = document.createElement('img');
            snapButton.src = '/img/camera.png';
            snapButton.classList.add('snapshot-button');
            snapButton.addEventListener('click', (event) => {
                this.snapshotContent();
            });
            container.appendChild(snapButton);
        },
        snapshotContent() {
            const options = {
                width: this.width * (300 / 96),
                height: this.height * (300 / 96),
            };
            const svg = (this.$refs.body as Vue).$el.getElementsByTagName('svg').item(0);
            if (svg) {
                saveSvgAsPng(svg, this.title + '.png', {
                    scale: 4,
                    encoderOptions: 1,
                });
            } else {
                toCanvas((this.$refs.body as Vue).$el as HTMLElement/*, options*/, {})
                    .then((canvas) => {
                        canvas.toBlob((blob) => {
                            saveAs(blob as Blob, this.title + '.png');
                        });
                    });
            }
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
}
.snapshot-button{
    width: 16px; 
    height: 16px; 
    margin-right: 7px; 
    margin-left: 0px; 
    position: absolute; 
    right: 54px;
    cursor:pointer;
}
.no-settings{
    text-align: center;
    margin:20px 0;
}
</style>