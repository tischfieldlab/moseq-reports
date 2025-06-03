<template>
    <component
        :is="renderMode"
        :width="layout.width"
        :height="layout.height"
        :data="positionData"
        :useGroups="useGroups"
        :groupLabels="groupNames"
        :groupColors="groupColors"
        :resolution="settings.resolution"
        :colorscale="settings.colormap"
        legendTitle="Relative Occupancy"
        :title="`Occupancy while in Module ${selectedSyllable} (${countMethod})`"
        xAxisTitle="Group"
        yAxisTitle="velocity_2d_mm"
    />
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import RegisterDataComponent from '@render/components/Core';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import HexBinPlotCanvas from '@render/components/Charts/HexBinPlot/HexBinPlotCanvas.vue';
import HexBinPlotSVG from '@render/components/Charts/HexBinPlot/HexBinPlotSVG.vue';
import { RenderMode } from '@render/store/datawindow.types';
import { CountMethod } from '@render/store/dataview.types';
import { PositionPlotSettings,PositionPlotMode } from './PositionPlot.types';
import DataService from '@api';
import { Operation } from '@render/api/DataLoader.types';

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
        const positionData = ref<any>([]);
        const { layout, dataview, settings, $wstate } = useWindowMixin<PositionPlotSettings>(props.id);
      console.log(dataview.availableModuleIds,settings.value)
        const selectedSyllable = computed(() => dataview.selectedSyllable);
        const countMethod = computed(() => dataview.countMethod);

        const renderMode = computed(() => {
            const mode = $wstate.render_mode;
            if (mode === RenderMode.CANVAS) {
                return 'HexBinPlotCanvas';
            } else if (mode === RenderMode.SVG) {
                return 'HexBinPlotSVG';
            } else {
                console.error('Invalid render mode:', mode);
                return 'HexBinPlotSVG';
            }
        });

        const useGroups = computed(() => settings.value.mode === PositionPlotMode.Grouped);
        const groupNames = computed(() => dataview.selectedGroups);
        const groupColors = computed(() => dataview.selectedGroupColors);

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
            ];
            return datasetOps;
        });

        const fetchPositionData = async () => {
            const rID = dataview.selectedSyllableMap.raw;
            const path = `scalars/${rID}`;
            try {
                const data = await DataService.fetchData(path, operations.value);
                positionData.value = data;
            } catch (error) {
                console.error("Error loading Position Plot data:", error);
                positionData.value = [];
            }
        };

        watch(operations, fetchPositionData, { immediate: true });

        watch(
            [
                () => dataview.selectedSyllableMap.raw,
                () => dataview.countMethod,
                () => dataview.selectedGroups,
                () => settings.value.mode,
            ],
            () => {
                fetchPositionData();
            },
            { immediate: true }
        );

        return {
            renderMode,
            layout,
            positionData,
            useGroups,
            groupNames,
            groupColors,
            settings,
            selectedSyllable,
            countMethod,
        };
    },
});
</script>
