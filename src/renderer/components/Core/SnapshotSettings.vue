<template>
    <b-container>
        <b-row>
            <b-col>
                <b-input-group prepend="Preferred Renderer">
                    <b-form-select v-model="renderer" :options="supported_renderers" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Output Format">
                    <b-form-select v-model="format" :options="supported_formats" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Quality" :append="quality_str">
                    <b-form-input debounce="150" v-model.number="quality" type="range" min="0" max="100"></b-form-input>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Scale">
                    <b-form-input v-model.number="scale" type="number" min="0" max="10"></b-form-input>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Background Color">
                    <chrome-picker v-model="backgroundColor" @update:modelValue="backgroundColorChanged" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-button ref="snapshot_button" @click="takeSnapshot()" class="float-right" :disabled="is_taking_snapshot">
                    <b-spinner v-show="is_taking_snapshot" small type="grow" />
                    <IBiCameraFill v-show="!is_taking_snapshot" />
                    Take Snapshot
                </b-button>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import {defineComponent, computed, nextTick, ref } from 'vue';
import Snapshot from '@render/components/Core/SnapshotHelper';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import { Chrome } from "@ckpack/vue-color";
import { RenderMode } from '@store/datawindow.types';
import WindowManager from '@render/components/Core/Window/WindowManager';



export default defineComponent({
    components: {
        'chrome-picker': Chrome,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const {$wstate, spec, title} = useWindowMixin(props.id);
        const is_taking_snapshot = ref(false);

        const supported_renderers = computed((): string[] => {
            return spec.value.available_render_modes
        });
        const supported_formats = computed((): string[] => {
            switch($wstate.render_mode) {
                case RenderMode.CANVAS:
                    return ['png'];
                case RenderMode.SVG:
                    return ['svg', 'png'];
                case RenderMode.VIDEO:
                    return ['video', 'png'];
                case RenderMode.HTML:
                    return ['png'];
                case RenderMode.UNDEFINED:
                default:
                    // tslint:disable-next-line:no-console
                    console.warn(`Invalid Render Mode '${$wstate.render_mode}`);
                    return [];
            }
        });

        const renderer = computed({
            get(): string {
                return $wstate.render_mode;
            },
            set(value: string) {
                $wstate.updateComponentRenderMode({
                    render_mode: value as RenderMode
                });
            },
        });
        const snapshot_settings = computed(() => {
            return $wstate.settings.snapshot;
        });
        const format = computed({
            get(): string {
                return $wstate.settings.snapshot.format;
            },
            set(value: string) {
                $wstate.updateComponentSettings({
                    settings: {
                        snapshot: {
                            format: value,
                        },
                    },
                });
            },
        });
        const quality = computed({
            get(): number {
                return $wstate.settings.snapshot.quality * 100;
            },
            set(value: number) {
                $wstate.updateComponentSettings({
                    settings: {
                        snapshot: {
                            quality: value / 100,
                        },
                    },
                });
            },
        });
        const quality_str = computed((): string => {
            return `${quality.value.toFixed(0)}%`;
        });
        const scale = computed({
            get(): number {
                return $wstate.settings.snapshot.scale;
            },
            set(value: number) {
                $wstate.updateComponentSettings({
                    settings: {
                        snapshot: {
                            scale: value,
                        },
                    },
                });
            },
        });
        const backgroundColor = computed({
            get(): string {
                return $wstate.settings.snapshot.backgroundColor;
            },
            set(value: { hex: string }) {
                console.log(value);
                $wstate.updateComponentSettings({
                    settings: {
                        snapshot: {
                            backgroundColor: value.hex,
                        },
                    },
                });
            },
        });
        
        function getComponent() {
            console.log('getComponent', WindowManager.getWindowByID(props.id));
            return WindowManager.getWindowByID(props.id)!;
        }
        function takeSnapshot() {
            is_taking_snapshot.value = true;
            nextTick(() => {
                Snapshot(getComponent(), title.value, snapshot_settings.value)
                    .finally(() => is_taking_snapshot.value = false);
            });
        }
        function backgroundColorChanged(event) {
            backgroundColor.value = event.hex;
        }

        return {
            renderer,
            supported_renderers,
            supported_formats,
            format,
            quality,
            scale,
            backgroundColor,
            is_taking_snapshot,
            takeSnapshot,
            backgroundColorChanged,
            quality_str,
        };
    },
});
</script>

<style>
.row{
    margin:10px 0;
}
.form-range {
    width: 1%;
    flex: 1 1;
    padding: 20px 5px 20px 5px;
    border-top: 1px solid var(--bs-border-color);
    border-bottom: 1px solid var(--bs-border-color);
    border-left: 1px solid var(--bs-border-color);
    background-color: var(--bs-body-bg);
}
</style>