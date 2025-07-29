<template>
    <component
        :is="renderMode"
        :width="layout.width"
        :height="layout.height"
        :data="entropyData"
        :groupLabels="groupNames"
        :groupColors="groupColors"
        :show_boxplot="settings.show_boxplot"
        :whisker_type="settings.boxplot_whiskers"
        :show_points="settings.show_points"
        :point_size="settings.point_size"
        :show_violinplot="settings.show_violinplot"
        :kde_scale="settings.violin_kde_scale"
        xAxisTitle="Group"
        :yAxisTitle="`${metricDisplayName} (bits)`"
        :tooltipFormatter=formatTooltip
    />
</template>

<script lang="ts">
import { defineComponent, shallowRef, computed, watch } from "vue";
import RegisterDataComponent from "@render/components/Core";
import {  WhiskerType, BoxPlotSVG, BoxPlotCanvas } from "@render/components/Charts/BoxPlot";
import { OrderingType } from "@render/components/Charts/ClusteredHeatmap";
import { RenderMode } from "@store/datawindow.types";
import { useWindowMixin }  from "@render/components/Core/Window/WindowMixin";
import DataService, { Operation } from "@api";
import { EntropySettings, availableMetrics } from "./Entropy.types";
import { watchEffect } from "vue";
import { useLoadingMixin } from "@render/components/Core/LoadingMixin";


RegisterDataComponent({
    friendly_name: "Entropy",
    component_type: "Entropy",
    settings_type: "EntropyOptions",
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.CANVAS, RenderMode.SVG],
    default_render_mode: RenderMode.SVG,
    default_settings: {
        entropy_metric: "entropy",
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

        const entropyData = shallowRef([]);
        const { layout, dataview, settings, $wstate} = useWindowMixin<EntropySettings>(props.id);
        const { emitFinishLoading, emitStartLoading } = useLoadingMixin();

        const metricDisplayName = computed((): string => {
            const metric_info = availableMetrics[settings.value.entropy_metric];
            if (metric_info.source === "entropy") {
                return metric_info.title;
            } else if (metric_info.source === "trans_entropy") {
                return `${metric_info.title} (Syllable ${dataview.value.selectedSyllable})`;
            } else {
                return "Unknown Metric";
            }
        });

        const dataset = computed((): [string, Operation[]] => {
            const metric_info = availableMetrics[settings.value.entropy_metric];
            let ops: Operation[] = [];
            if (metric_info.source === "entropy") {
                ops = [{
                    type: "map",
                    columns: [
                        ["uuid", "id"],
                        ["group", "group"],
                        [settings.value.entropy_metric, "value"],
                    ],
                }, {
                    type: "filter",
                    filters: {
                        group: dataview.value.selectedGroups,
                    },
                }];
            } else if (metric_info.source === "trans_entropy") {
                ops = [{
                    type: "map",
                    columns: [
                        ["uuid", "id"],
                        ["group", "group"],
                        [`id_${dataview.value.countMethod.toLowerCase()}`, 'syllable'],
                        [settings.value.entropy_metric, "value"],
                    ],
                }, {
                    type: "filter",
                    filters: {
                        group: dataview.value.selectedGroups,
                        syllable: [dataview.value.selectedSyllable],
                    },
                }];
            }

            return [ metric_info.source, ops]
        });

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
                        Value: ${itm.value.toExponential(3)}`;
            } else if ("count" in itm) {
                return `Group: ${itm.group}<br />
                        Count: ${itm.count.toString()}<br />
                        Median: ${itm.q2.toExponential(3)}<br />`;
            } else {
                return JSON.stringify(itm, undefined, "\t");
            }
        };
  
        watchEffect(async () => {
            emitStartLoading();
            const [source, ops] = dataset.value;
            entropyData.value = await DataService.fetchData<any>(source, ops);
            emitFinishLoading();
        });
  
        return {
            renderMode,
            entropyData,
            settings,
            groupNames,
            groupColors,
            formatTooltip,
            layout,
            metricDisplayName,
        };
    },
});
</script>
