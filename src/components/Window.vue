<template>
    <JqxWindow ref="window" 
        @resized="onResized($event)"
        @moved="onMoved($event)"
        @close="onClosed($event)"
        :maxWidth="max_width"
        :showCollapseButton="true">
        <div> <!--:style="{background: titlebar_color, color: getContrast(dataview.color)}"-->
            <span class="dataview-swatch" :id="$id('swatch')" :style="{background: titlebar_color}" :title="swatch_title"></span>
            {{ title }}
        </div>
        <div>
            <b-overlay :show="is_loading" no-fade>
                <component ref="body" :id="id" :is="spec.component_type" />
            </b-overlay>
            <b-modal
                :title="settings_title"
                v-model="show_settings_modal"
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
                    <b-tab title="Snapshots">
                        <SnapshotSettings :id="id" />
                    </b-tab>
                </b-tabs>

            </b-modal>
        </div>
    </JqxWindow>
</template>


<script lang="ts">
import Vue from 'vue';

import JqxWindow from 'jqwidgets-scripts/jqwidgets-vue/vue_jqxwindow.vue';
import { Size, Position, Layout } from '@/store/datawindow.types';
import Snapshot, { ensureDefaults } from '@/components/Core/SnapshotHelper';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin.ts';
import {getContrastingColor} from '@/components/Charts/D3ColorProvider';


export default mixins(WindowMixin).extend({
    components: {
        JqxWindow,
    },
    data() {
        return {
            title_offset: 30,
            component_loading: 0,
            show_settings_modal: false,
            watchers: Array<(() => void)>(),
        };
    },
    computed: {
        settings_title(): string {
            return this.title + ' Settings';
        },
        is_loading(): boolean {
            const s = this.dataview;
            return this.component_loading > 0 || (s && s.loading);
        },
        max_width(): number {
            return window.innerWidth;
        },
        titlebar_color(): string {
            return this.dataview.color;
        },
        swatch_title(): string {
            return `Using ${this.dataview.name}`;
        },
    },
    watch: {
        layout: {
            deep: true,
            handler(newValue: Layout) {
                this.updateWindowLayout(newValue);
            },
        },
        title(newValue) {
            (this.$refs.window as any).title = newValue;
        },
        titlebar_color: {
            handler(newValue) {
                const swatch = document.getElementById(this.$id('swatch'));
                if (swatch) {
                    swatch.style.backgroundColor = newValue;
                }
            },
        },
        swatch_title: {
            handler(newValue) {
                const swatch = document.getElementById(this.$id('swatch'));
                if (swatch) {
                    swatch.title = newValue;
                }
            }
        }
    },
    mounted() {
        // Create the settings button on the next tick when the DOM is ready
        this.$nextTick().then(() => {
            this.addSettingsButton();
            this.updateWindowLayout(this.layout);
            ensureDefaults(this.$refs.body as Vue, this.$store);
        });
        (this.$refs.body as Vue).$on('start-loading', () => {
            this.component_loading++;
            // console.log('start', this, this.component_loading);
        });
        (this.$refs.body as Vue).$on('finish-loading', () => {
            this.component_loading = clamp(this.component_loading - 1, 0);
            // console.log('end', this, this.component_loading);
        });
    },
    beforeDestroy() {
        // un-watch the store
        this.watchers.forEach((w) => w());
    },
    methods: {
        updateWindowLayout(layout: Layout) {
            (this.$refs.window as any).width = layout.width;
            (this.$refs.window as any).height = layout.height;
            (this.$refs.window as any).position = {
                x: layout.position.x,
                y: layout.position.y + this.title_offset,
            } as Position;
        },
        onResized(event: any) {
            const s = event.args as Size;
            this.$store.commit(`${this.id}/updateComponentLayout`, {
                id: this.id,
                width: s.width,
                height: s.height,
            });
        },
        onMoved(event: any) {
            const p = event.args as Position;
            this.$store.commit(`${this.id}/updateComponentLayout`, {
                id: this.id,
                position_x: p.x,
                position_y: clamp(p.y - this.title_offset, 0),
            });
        },
        onClosed(event: any) {
            this.$store.dispatch('datawindows/removeWindow', this.id);
        },
        addSettingsButton() {
            const container = document.createElement('div');

            const settingsButton = document.createElement('img');
            settingsButton.src = '/img/gear.png';
            settingsButton.classList.add('settings-button');
            settingsButton.addEventListener('click', (event) => {
                this.show_settings_modal = true;
            });

            container.appendChild(settingsButton);
            this.$el.children[0].children[0].appendChild(container);

            const snapButton = document.createElement('img');
            snapButton.src = '/img/camera.png';
            snapButton.classList.add('snapshot-button');
            snapButton.addEventListener('click', (event) => {
                this.snapshotContent(event);
            });
            container.appendChild(snapButton);
        },
        async snapshotContent(event: MouseEvent) {
            await Snapshot(this.$refs.body as Vue, this.title, this.settings.snapshot);
        },
        getContrast(hexcolor: string): string {
            const c = getContrastingColor(hexcolor);
            if (c === 'dark') {
                return 'black';
            } else {
                return 'white';
            }
        },
    },
});

function clamp(value: number, min = Number.MIN_VALUE, max = Number.MAX_VALUE) {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}
</script>

<style lang="scss">
.jqx-window-content {
    padding:0px !important;
}
.b-overlay-wrap {
    display: flex;
    width: 100%;
    height: 100%;
}
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
.dataview-swatch {
    display: inline-block;
    vertical-align: text-top;
    width: 16px;
    height: 16px;
    border-radius: 16px;
    border: 1px solid #c5c5c5;
    cursor: default;
}
</style>