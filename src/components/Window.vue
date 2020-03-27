<template>
    <JqxWindow ref="window" 
        @resized="onResized($event)"
        @moved="onMoved($event)"
        @close="onClosed($event)"
        :width="layout.width"
        :height="layout.height"
        :position="layout.position"
        :showCollapseButton="true">
        <div>
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
import Vue, { PropType } from 'vue';

import JqxWindow from 'jqwidgets-scripts/jqwidgets-vue/vue_jqxwindow.vue';
import {ComponentRegistration} from '../store/root.types';
import {Size, Position, Layout} from '@/store/datawindow.types';
import { unnest } from '@/util/Vuex';
import Snapshot, {ensureDefaults} from '@/components/Core/SnapshotHelper';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin.ts';

export default mixins(WindowMixin).extend({
    components: {
        JqxWindow,
    },
    data() {
        return {
            component_loading: false,
            show_settings_modal: false,
            watchers: Array<(() => void)>(),
        };
    },
    computed: {
        settings_title(): string {
            return this.title + ' Settings';
        },
        is_loading(): boolean {
            const s = unnest(this.$store.state, this.datasource);
            return this.component_loading || (s && s.loading);
        },
    },
    watch: {
        layout: {
            deep: true,
            handler(newValue) {
                (this.$refs.window as any).width = newValue.width;
                (this.$refs.window as any).height = newValue.height;
                (this.$refs.window as any).position = newValue.position;
            },
        },
        title(newValue) {
            (this.$refs.window as any).title = newValue;
        },
    },
    mounted() {
        // Create the settings button on the next tick when the DOM is ready
        this.$nextTick().then(() => {
            this.addSettingsButton();
        });
        (this.$refs.body as Vue).$on('start-loading', () => this.component_loading = true);
        (this.$refs.body as Vue).$on('finish-loading', () => this.component_loading = false);
    },
    beforeDestroy() {
        // un-watch the store
        this.watchers.forEach((w) => w());
    },
    methods: {
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
                position_y: p.y,
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
            ensureDefaults(this.$refs.body as Vue, this.$store);
            const options = this.settings.snapshot;
            await Snapshot(this.$refs.body as Vue, this.title, options);
        },
    },
});
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
</style>