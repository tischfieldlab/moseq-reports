<template>
    <component
        :is="renderMode"
        :width="layout.width"
        :height="layout.height"
        :data="individualUsageData"
        :groupLabels="groupNames"
        :groupColors="groupColors"
        :show_boxplot="settings.show_boxplot"
        :whisker_type="settings.boxplot_whiskers"
        :show_points="settings.show_points"
        :point_size="settings.point_size"
        :show_violinplot="settings.show_violinplot"
        :kde_scale="settings.violin_kde_scale"
        xAxisTitle="Group"
        :yAxisTitle="`Module #${selectedSyllable} Usage (${countMethod})`"
        :tooltipFormatter=formatTooltip
    />
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import RegisterDataComponent from "@render/components/Core";
import {  WhiskerType, BoxPlotSVG, BoxPlotCanvas } from "@render/components/Charts/BoxPlot";
import { OrderingType } from "@render/components/Charts/ClusteredHeatmap";
import { RenderMode } from "@store/datawindow.types";
import { useWindowMixin }  from "@render/components/Core/Window/WindowMixin";
import DataService, { Operation } from "@api";
import { DetailedUsageSettings } from "./DetailedUsage.types";


RegisterDataComponent({
    friendly_name: "Usage Details",
    component_type: "DetailedUsage",
    settings_type: "DetailedUsageOptions",
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.CANVAS, RenderMode.SVG],
    default_render_mode: RenderMode.SVG,
    default_settings: {
        show_points: true,
        point_size: 2,
        show_boxplot: true,
        show_violinplot: false,
        violin_kde_scale: 0.01,
        boxplot_whiskers: WhiskerType.TUKEY,
        group_order_type: OrderingType.Natural,
    },
});

export default defineComponent({
    name: "UsageDetails",
    components: {
        BoxPlotCanvas,
        BoxPlotSVG,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {

        const individualUsageData = ref([]);
        const { layout, dataview, settings, $wstate} = useWindowMixin<DetailedUsageSettings>(props.id);
        const selectedSyllable = computed(() => dataview.value.selectedSyllable);
        const countMethod = computed(() => dataview.value.countMethod.toLowerCase());
        const dataset = computed((): Operation[] =>
            [{
                type: "map",
                columns: [
                    [`usage_${countMethod.value.toLowerCase()}`, "value"],
                    ["group", "group"],
                    [`id_${countMethod.value.toLowerCase()}`, "syllable"],
                    ["uuid", "id"],
                ],
            }, {
                type: "filter",
                filters: {
                    syllable: [selectedSyllable.value],
                    group: dataview.value.selectedGroups,
                },
            }, {
                type: "sort",
                columns: [["value", "asc"]],
            }]
        );

        const renderMode = computed(() => {
            const mode = $wstate.render_mode;
            if (mode === RenderMode.CANVAS) {
                return "BoxPlotCanvas";
            } else if (mode === RenderMode.SVG) {
                return "BoxPlotSVG";
            } else {
                console.error("invalid render mode", mode);
                return "BoxPlotSVG";
            }
        });

        const groupNames = computed(() => {
            if (settings.value.group_order_type === OrderingType.Natural) {
                return dataview.value.selectedGroups;
            } else if (settings.value.group_order_type === OrderingType.Dataset) {
                const datasetGroups = dataview.value.views[settings.value.group_order_dataset];
                if (datasetGroups !== undefined) {
                    return datasetGroups.data;
                }
            } else {
                console.warn(`Unsupported group order type ${settings.value.group_order_type}`);
            }
            return [];
        });
        const groupColors = computed(() => {
            const colors = Object.fromEntries(dataview.value.groups.map((g) => [g.name, g.color]));
            return groupNames.value.map((gn) => colors[gn] = colors[gn]);
        });

        const formatTooltip = (itm: any): string => {
            if ("id" in itm) {
                return `ID: ${itm.id.split("-").pop()}<br />
                        Usage: ${itm.value.toExponential(3)}`;
            } else if ("count" in itm) {
                return `Group: ${itm.group}<br />
                        Count: ${itm.count.toString()}<br />
                        Median: ${itm.q2.toExponential(3)}<br />`;
            } else {
                return JSON.stringify(itm, undefined, "\t");
            }
        };
  
        watch(
            dataset,
            async () => {
                DataService.fetchData<any>("usage", dataset.value)
                    .then((data) => {
                        individualUsageData.value = data;
                    })
                    .catch((error) => {
                        console.error("Error loading Detailed Usage data:", error);
                    });
            },
            { immediate: true }
        );
  
        return {
            renderMode,
            individualUsageData,
            settings,
            selectedSyllable,
            countMethod,
            groupNames,
            groupColors,
            formatTooltip,
            layout,
        };
    },
});
</script>
