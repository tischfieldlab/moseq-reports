<template>
    <BContainer fluid>
        <BRow>
            <BCol>
                <BInputGroup prepend="Display Mode">
                    <BFormSelect v-model="mode" :options="mode_options" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <BInputGroup prepend="Colormap" style="flex-wrap: nowrap">
                    <ColorScalePicker v-model="colorscale" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <BInputGroup prepend="Resolution">
                    <BFormInput type="number" v-model="resolution" min="1" max="10" />
                </BInputGroup>
            </BCol>
        </BRow>
    </BContainer>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";
import ColorScalePicker from "@render/components/Charts/Colors/ColorScalePicker.vue";
import { PositionPlotSettings, PositionPlotMode } from './PositionPlot.types';

export default defineComponent({
    components: {
        ColorScalePicker,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const { $wstate } = useWindowMixin<PositionPlotSettings>(props.id);

        const mode = computed({
            get: () => $wstate.settings.mode,
            set: (value: string) => {
                if (value !== $wstate.settings.mode) {
                    $wstate.updateComponentSettings({
                        settings: { mode: value as PositionPlotMode },
                    });
                }
            },
        });

        const colorscale = computed({
            get: () => $wstate.settings.colormap,
            set: (value: string) => {
                if (value !== $wstate.settings.colormap) {
                    $wstate.updateComponentSettings({
                        settings: { colormap: value },
                    });
                }
            },
        });

        const resolution = computed({
            get: () => $wstate.settings.resolution,
            set: (value: string) => {
                const parsedValue = parseInt(value);
                if (parsedValue !== $wstate.settings.resolution) {
                    $wstate.updateComponentSettings({
                        settings: { resolution: parsedValue },
                    });
                }
            },
        });

        const mode_options = [
            { text: "Overall", value: PositionPlotMode.Overall },
            { text: "Grouped", value: PositionPlotMode.Grouped },
        ];

        return {
            mode,
            colorscale,
            resolution,
            mode_options,
        };
    },
});
</script>

<style scoped>
.row {
    margin: 10px 0;
}
</style>
