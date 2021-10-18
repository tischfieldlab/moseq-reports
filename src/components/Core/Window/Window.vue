<template>
    <BaseWindow
        ref="window"
        :id="id"
        :titlebar_color="titlebar_color"
        :title="title"
        :width="this.window_width"
        :height="this.window_height"
        :pos="layout.position"
        @onClosed="onClosed"
        @onMoved="onMoved"
        @onResized="onResized"
        @onWindowFocused="onWindowFocused"
        :zIndex="z_index"
        :aspectRatio="aspect_ratio"
    >
        <template v-slot:titlebarButtons>
            <titlebar-button :clicked="onSnapshotClicked" icon="camera-fill" />
            <titlebar-button :clicked="onSettingsClicked" icon="gear-fill" />
        </template>
        <b-overlay :show="is_loading" no-fade class="overlay-container">
            <component ref="body" :id="id" :is="spec.component_type" />
        </b-overlay>

        <b-modal
            :title="settings_title"
            v-model="show_settings_modal"
            header-bg-variant="dark"
            header-text-variant="light"
            body-bg-variant="light"
            body-text-variant="dark"
            hide-footer
        >
            <b-tabs>
                <b-tab title="Layout">
                    <LayoutSettings :id="id" />
                </b-tab>
                <b-tab title="Data">
                    <DataSettings :id="id" />
                </b-tab>
                <b-tab title="Component">
                    <component
                        v-if="spec.settings_type"
                        ref="modal_component"
                        :id="id"
                        :is="spec.settings_type"
                    />
                    <p v-else class="no-settings text-muted">
                        No settings available for this component
                    </p>
                </b-tab>
                <b-tab title="Snapshots">
                    <SnapshotSettings :id="id" />
                </b-tab>
            </b-tabs>
        </b-modal>
    </BaseWindow>
</template>


<script lang="ts">
import BaseWindow from './BaseWindow.vue';
import mixins from 'vue-typed-mixins';
import WindowMixin from './WindowMixin';
import Snapshot, { ensureDefaults } from '../SnapshotHelper';
import { Position, Size } from '@/store/datawindow.types';
import TitlebarButton from '@/components/Core/Window/WindowTitlebarButton.vue';

export default mixins(WindowMixin).extend({
    components: {
        BaseWindow,
        TitlebarButton,
    },
    mounted() {
        this.$nextTick().then(() => {
            ensureDefaults(this.$refs.body as Vue, this.$store);
        });
        (this.$refs.body as Vue).$on('start-loading', () => {
            this.component_loading++;
        });
        (this.$refs.body as Vue).$on('finish-loading', () => {
            this.component_loading = clamp(this.component_loading - 1, 0);
        });
    },
    data() {
        return {
            show_settings_modal: false,
            component_loading: 0,
            watchers: Array<() => void>()
        };
    },
    computed: {
        settings_title(): string {
            return this.title + ' Settings';
        },
        max_width(): number {
            return window.innerWidth;
        },
        max_height(): number {
            return window.innerHeight;
        },
        titlebar_color(): string {
            return this.dataview.color;
        },
        swatch_title(): string {
            return `Using ${this.dataview.name}`;
        },
        is_loading(): boolean {
            const s = this.dataview;
            return this.component_loading > 0 || (s && s.loading);
        },
        z_index(): number {
            return this.$store.getters[`${this.id}/zIndex`];
        },
        aspect_ratio(): number {
            return this.$store.getters[`${this.id}/aspectRatio`];
        },
        window_width(): number {
            return this.layout.width;
        },
        window_height(): number {
            return this.layout.height;
        }
    },
    watch: {
        title(newValue) {
            (this.$refs.window as any).title = newValue;
        },
        titlebar_color: {
            handler(newValue) {
                const swatch = document.getElementById(this.$id('swatch'));
                if (swatch) swatch.style.backgroundColor = newValue;
            },
        },
        swatch_title: {
            handler(newValue) {
                const swatch = document.getElementById(this.$id('swatch'));
                if (swatch) swatch.title = newValue;
            },
        },
    },
    methods: {
        onResized(event: any) {
            const s: Size = {
                width: event.width,
                height: event.height,
            };
            this.$store.commit(`${this.id}/updateComponentLayout`, {
                id: this.id,
                width: s.width,
                height: s.height,
            });
        },
        onSettingsClicked(event: any) {
            this.show_settings_modal = true;
        },
        onSnapshotClicked(event: any) {
            this.snapshotContent(event);
        },
        onMoved(event: any) {
            const p: Position = {
                x: event.x,
                y: event.y,
            };

            this.$store.commit(`${this.id}/updateComponentLayout`, {
                id: this.id,
                position_x: p.x,
                position_y: clamp(p.y, 0),
            });
        },
        onClosed(event: any) {
            this.$store.dispatch('datawindows/removeWindow', this.id);
        },
        async snapshotContent(event: MouseEvent) {
            await Snapshot(
                this.$refs.body as Vue,
                this.title,
                this.settings.snapshot
            );
        },
        onWindowFocused() {
            const maxZ: number = this.$store.getters['datawindows/windowsMaxZIndex'] + 1;
            this.$store.commit(`${this.id}/updateZIndex`, { z_index: maxZ });
        }
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

<style scoped>
.overlay-container {
    width: inherit;
    height: inherit;
}
</style>