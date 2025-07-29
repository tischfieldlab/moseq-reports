<template>
    <BContainer fluid>
        <BRow>
            <BCol>
                <BInputGroup prepend="Colormap" style="flex-wrap:nowrap">
                    <ColorScalePicker v-model="colormap" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <BInputGroup prepend="vMin">
                    <b-form-input type="number" v-model.number="vmin" :disabled="auto_vmin" />
                    <BInputGroupText>
                        <b-form-checkbox v-model="auto_vmin" switch />
                    </BInputGroupText>
                </BInputGroup>
            </BCol>
            <BCol>
                <BInputGroup prepend="vMax">
                    <b-form-input type="number" v-model.number="vmax" :disabled="auto_vmax" />
                    <BInputGroupText>
                        <b-form-checkbox v-model="auto_vmax" switch />
                    </BInputGroupText>
                </BInputGroup>
            </BCol>
        </BRow>
    </BContainer>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import ColorScalePicker from '@render/components/Charts/Colors/ColorScalePicker.vue';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import { ColormapSettings, CommonProps } from './Options.types';

const props = defineProps<CommonProps>();
const { $wstate } = useWindowMixin<ColormapSettings>(props.id);

const colormap = computed({
    get(): string {
        return $wstate.settings.colormap;
    },
    set(value: string) {
        if (value === $wstate.settings.colormap) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                colormap: value,
            },
        });
    },
});
const auto_vmin = computed({
    get(): boolean {
        return $wstate.settings.auto_vmin;
    },
    set(value: boolean) {
        if (value === $wstate.settings.auto_vmin) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                auto_vmin: value,
            },
        });
    },
});

const auto_vmax = computed({
    get(): boolean {
        return $wstate.settings.auto_vmax;
    },
    set(value: boolean) {
        if (value === $wstate.settings.auto_vmax) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                auto_vmax: value,
            },
        });
    },
});
const vmin = computed({
    get(): number {
        return $wstate.settings.vmin;
    },
    set(value: number) {
        if (value === $wstate.settings.vmin) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                vmin: value,
            },
        });
    },
});
const vmax = computed({
    get(): number {
        return $wstate.settings.vmax;
    },
    set(value: number) {
        if (value === $wstate.settings.vmax) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                vmax: value,
            },
        });
    },
});
</script>

<style scoped>
</style>