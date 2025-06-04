<template>
    <component :is="render_mode"
        :width="layout.width"
        :height="layout.height"
        :data="aggregateView"
        :groupLabels="selectedGroups"
        :colorscale="settings.colormap"
        :vmin="settings.auto_vmin ? undefined : settings.vmin"
        :vmax="settings.auto_vmax ? undefined : settings.vmax"

        :columnOrderType="settings.column_order_type"
        :columnClusterDistance="settings.column_cluster_distance"
        :columnClusterLinkage="settings.column_cluster_linkage"
        :columnClusterK="settings.column_cluster_k"
        :columnOrderValue="settings.column_order_row_value"
        :columnOrderDirection="settings.column_order_direction"
        :columnLabelColor="columnLabelColors"

        :rowOrderType="settings.row_order_type"
        :rowClusterDistance="settings.row_cluster_distance"
        :rowClusterLinkage="settings.row_cluster_linkage"
        :rowClusterK="settings.row_cluster_k"
        :rowOrderValue="settings.row_order_column_value"
        :rowOrderDirection="settings.row_order_direction"
        :rowOrderDataset="rowOrderDataset"

        xAxisTitle="Individual"
        :yAxisTitle="`Syllable ID (${dataview.countMethod})`"
        :legendTitle="`Usage (${dataview.countMethod})`"
        columnKey="uuid"
        rowKey="syllable"
        valueKey="usage"
        :selectedRow="dataview.selectedSyllable"
        @heatmap-click="onHeatmapClick"
        @row-order-changed="rowOrderChanged"
        @col-order-changed="colOrderChanged"
        :tooltipFormatter="heatmap_node_tooltip"
    />
</template>

<script lang="ts">
RegisterDataComponent({
    friendly_name: 'Individual Usage Heatmap',
    component_type: 'IndividualUsageHeatmap',
    settings_type: 'IndividualUsageHeatmapOptions',
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.CANVAS, RenderMode.SVG],
    default_render_mode: RenderMode.CANVAS,
    default_settings: {
        ...ColormapSettingsDefaults(),
        ...ColumnOrderingSettingsDefaults(),
        ...RowOrderingSettingsDefaults(),
        color_columns: true,
        color_columns_data: 'group',
    },
});
</script>
<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import RegisterDataComponent from '@render/components/Core';
import { RenderMode } from '@store/datawindow.types';
import { ClusteredHeatmapCanvas, ClusteredHeatmapSVG, ColormapSettingsDefaults, ColumnOrderingSettingsDefaults, RowOrderingSettingsDefaults } from '@render/components/Charts/ClusteredHeatmap';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import { UsageHeatmapSettings } from './IndividualUsageHeatmap.types';
import DataService, { Operation } from '@render/api';
import { shallowRef } from 'vue';

const props = defineProps<{
    id: string;
}>();

const {$wstate, dataview, layout, settings} = useWindowMixin<UsageHeatmapSettings>(props.id);

interface IndividualUsageHeatmapData {
    uuid: string;
    group: string;
    syllable: number;
    usage: number;
}

const aggregateView = shallowRef<IndividualUsageHeatmapData[]>([]);




const render_mode = computed(() => {
    if ($wstate.render_mode === RenderMode.CANVAS) {
        return ClusteredHeatmapCanvas;
    } else if ($wstate.render_mode === RenderMode.SVG) {
        return ClusteredHeatmapSVG;
    } else {
        // tslint:disable-next-line:no-console
        console.error('invalid render mode', $wstate.render_mode);
        return ClusteredHeatmapSVG;
    }
});
const columnLabelColors = computed((): {[column: string]: string} => {
    if ($wstate.settings.color_columns && aggregateView.value) {
        return Object.fromEntries(
            aggregateView.value
                .slice()
                .map((itm) => {
                    return [
                        itm.uuid,
                        dataview.value.selectedGroupColors[dataview.value.selectedGroups.indexOf(itm.group)]
                    ];
                }));
    } else {
        return {};
    }
});
// returns groups contained in aggregateView.
const selectedGroups = computed((): string[] => {
    if (!aggregateView.value) {
        return [];
    }
    return [...new Set(aggregateView.value.slice()
                            .sort((a,b) => (a.group as string).localeCompare(b.group))
                            .map((row) => row.uuid))];
});

// returns current order of dataset if changes occur to it.
const rowOrderDataset = computed((): any[] => {
    if ($wstate.settings.row_order_dataset in dataview.value.views) {
        return dataview.value.views[$wstate.settings.row_order_dataset].data;
    }
    return [];
});
const dataset = computed((): Operation[] => {
    return [
        {
            type: 'map',
            columns: [
                [`usage_${dataview.value.countMethod.toLowerCase()}`, 'usage'],
                ['uuid', 'uuid'],
                ['group', 'group'],
                [`id_${dataview.value.countMethod.toLowerCase()}`, 'syllable'],
            ],
        },
        {
            type: 'filter',
            filters: {
                group: dataview.value.selectedGroups,
                syllable: dataview.value.selectedSyllables,
            },
        },
    ];
});

watchEffect(async () => {
    await DataService.fetchData<IndividualUsageHeatmapData[]>('usage', dataset.value)
        .then((data) => {
            data.forEach((itm) => { itm.uuid = itm.uuid.split('-').pop() as string; });
            aggregateView.value = data
        });
});



function onHeatmapClick(event) {
    if (event.row) {
        dataview.value.selectedSyllable = Number.parseInt(event.row, 10);
    }
}
// changes row order by sending a signal to store to commit mutation publishDataset.
function rowOrderChanged(event) {
    dataview.value.publishDataset({
        owner: props.id,
        name: 'Row Order',
        data: event,
    });
}
// changes column order by sending a signal to store to commit mutation publishDataset.
function colOrderChanged(event) {
    dataview.value.publishDataset({
        owner: props.id,
        name: 'Column Order',
        data: event,
    });
}
// Gives UUID, Group, Module, and Usage current names based on the current data.
function heatmap_node_tooltip(item: any) {
    return `<div style="text-align:left;">
                UUID: ${item.uuid}<br />
                Group: ${item.group}<br />
                Module: ${item.syllable}<br />
                Usage: ${item.usage.toExponential(3)}
            </div>`;
}
</script>

<style scoped>

</style>