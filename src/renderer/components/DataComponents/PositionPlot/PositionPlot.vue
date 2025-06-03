<template>
    <component
        :is="renderMode"
        :width="layout.width"
        :height="layout.height"
        :data="positionData"
        :useGroups="useGroups"
        :groupLabels="dataview.selectedGroups"
        :resolution="settings.resolution"
        :colorscale="settings.colormap"
        legendTitle="Relative Occupancy"
        :title="`Occupancy while in Syllable ${dataview.selectedSyllable} (${dataview.countMethod})`"
    />
</template>

<script lang="ts">
import { defineComponent, ref, computed, watchEffect } from 'vue';
import RegisterDataComponent from '@render/components/Core';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import { RenderMode } from '@store/datawindow.types';
import { CountMethod } from '@store/dataview.types';
import { PositionPlotSettings, PositionPlotMode } from './PositionPlot.types';
import DataService, { Operation } from '@api';
import { HexBinPlotCanvas, HexBinPlotSVG, Observation } from '@render/components/Charts/HexBinPlot';

RegisterDataComponent({
    friendly_name: 'Position Plot',
    component_type: 'PositionPlot',
    settings_type: 'PositionPlotOptions',
    init_width: 400,
    init_height: 380,
    available_render_modes: [RenderMode.SVG, RenderMode.CANVAS],
    default_render_mode: RenderMode.SVG,
    default_settings: {
        mode: PositionPlotMode.Overall,
        resolution: 5,
        colormap: 'interpolateBuPu',
    },
});

export default defineComponent({
    name: "PositionPlot",
    components: {
        HexBinPlotCanvas,
        HexBinPlotSVG,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const positionData = ref<Observation[]>([]);
        const { layout, dataview, settings, $wstate } = useWindowMixin<PositionPlotSettings>(props.id);

        const renderMode = computed(() => {
            const mode = $wstate.render_mode;
            if (mode === RenderMode.CANVAS) {
                return HexBinPlotCanvas;
            } else if (mode === RenderMode.SVG) {
                return HexBinPlotSVG;
            } else {
                console.error('Invalid render mode:', mode);
                return HexBinPlotSVG;
            }
        });

        const useGroups = computed(() => settings.value.mode === PositionPlotMode.Grouped);

        const operations = computed(() => {
            const datasetOps: Operation[] = [
                {
                    type: "map",
                    columns: [
                        ["uuid", "id"],
                        ["centroid_x_mm", "x"],
                        ["centroid_y_mm", "y"],
                        "group",
                    ],
                },
                {
                    type: "filter",
                    filters: {
                        group: dataview.selectedGroups,
                    },
                }
            ];
            return datasetOps;
        });

        watchEffect(async () => {
            const rID = dataview.selectedSyllableAs(CountMethod.Raw);
            const path = `scalars/${rID}`;
            DataService.fetchData<Observation[]>(path, operations.value)
                .then(data => {
                    positionData.value = data;
                })
                .catch(error => {
                    console.error("Error fetching Position Plot data:", error);
                    positionData.value = [];
                });
        });

        return {
            renderMode,
            layout,
            positionData,
            useGroups,
            settings,
            dataview,
        };
    },
});
</script>
