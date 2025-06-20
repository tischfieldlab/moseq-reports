<template>
    <component :is="render_mode"
        :width="layout.width"
        :height="layout.height"
        :data="aggregateView"
        :columnLabels="dataview.selectedSyllables as any[]"
        :colorscale="settings.colormap"
        :vmin="settings.auto_vmin ? undefined : settings.vmin"
        :vmax="settings.auto_vmax ? undefined : settings.vmax"

        :columnOrderType="settings.column_order_type"
        :columnClusterDistance="settings.column_cluster_distance"
        :columnClusterLinkage="settings.column_cluster_linkage"
        :columnClusterK="settings.column_cluster_k"
        :columnOrderValue="settings.column_order_row_value"
        :columnOrderDirection="settings.column_order_direction"
        :columnOrderDataset="columnOrderDataset"

        :rowOrderType="settings.row_order_type"
        :rowClusterDistance="settings.row_cluster_distance"
        :rowClusterLinkage="settings.row_cluster_linkage"
        :rowClusterK="settings.row_cluster_k"
        :rowOrderValue="settings.row_order_column_value"
        :rowOrderDirection="settings.row_order_direction"
        :rowOrderDataset="rowOrderDataset"

        :xAxisTitle="`Destination Syllable (${dataview.countMethod})`"
        :yAxisTitle="`Source Syllable (${dataview.countMethod})`"
        :legendTitle="`Behavioral Distance (${settings.distance_metric})`"
        columnKey="sink"
        rowKey="source"
        valueKey="value"
        :selectedRow="dataview.selectedSyllable"
        :selectedCol="dataview.selectedSyllable"
        @heatmap-click="onHeatmapClick"
        @row-order-changed="rowOrderChanged"
        @col-order-changed="colOrderChanged"
        :tooltipFormatter="heatmap_node_tooltip"
    />
</template>

<script lang="ts">
RegisterDataComponent({
    friendly_name: 'Behavioral Distance Heatmap',
    component_type: 'BehavioralDistanceHeatmap',
    settings_type: 'BehavioralDistanceHeatmapOptions',
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.CANVAS, RenderMode.SVG],
    default_render_mode: RenderMode.CANVAS,
    default_settings: {
        distance_metric: 'ar[init]',
        ...ColormapSettingsDefaults(),
        ...ColumnOrderingSettingsDefaults(),
        ...RowOrderingSettingsDefaults(),
    },
});
</script>

<script setup lang="ts">
import { shallowRef, computed, watchEffect } from 'vue';
import { ClusteredHeatmapSVG, ClusteredHeatmapCanvas, ColormapSettingsDefaults, ColumnOrderingSettingsDefaults, RowOrderingSettingsDefaults } from '@render/components/Charts/ClusteredHeatmap';
import { RenderMode } from '@store/datawindow.types';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import { BehavioralDistanceHeatmapSettings } from './BehavioralDistanceHeatmap.types';
import DataService, {Operation} from '@render/api';
import RegisterDataComponent from '@render/components/Core';
import { useLoadingMixin } from '@render/components/Core/LoadingMixin';

interface BehavioralDistanceData {
    source: string;
    sink: string;
    value: number;
}

const props = defineProps<{
    id: string;
}>();

const {$wstate, dataview, layout, settings} = useWindowMixin<BehavioralDistanceHeatmapSettings>(props.id);
const { emitFinishLoading, emitStartLoading } = useLoadingMixin();

const aggregateView = shallowRef<BehavioralDistanceData[]>([]);


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
// Reacts to changes in properties `row_order_dataset`, and `dataset.views` in settings` to return new row order
const rowOrderDataset = computed((): any[] => {
    if ($wstate.settings.row_order_dataset in dataview.value.views) {
        return dataview.value.views[$wstate.settings.row_order_dataset].data;
    }
    return [];
});
// Reacts to changes in properties `column_order_dataset`, and `dataset.views` in settings to return new column ordering.
const columnOrderDataset = computed((): any[] => {
    if ($wstate.settings.column_order_dataset in dataview.value.views) {
        return dataview.value.views[$wstate.settings.column_order_dataset].data;
    }
    return [];
});


const dataset = computed((): Operation[] =>{
    let syllables;
    if (dataview.value.moduleIdFilter.length === 0) {
        syllables = dataview.value.availableModuleIds;
    } else {
        syllables = dataview.value.moduleIdFilter;
    }
    return [
        {
            type: 'map',
            columns: [
                [`row_id_${dataview.value.countMethod.toLowerCase()}`, 'source'],
                [`col_id_${dataview.value.countMethod.toLowerCase()}`, 'sink'],
                [$wstate.settings.distance_metric, 'value'],
            ],
        }, {
            type: 'filter',
            filters: {
                source: dataview.value.selectedSyllables,
                sink: dataview.value.selectedSyllables,
            }
        }
    ];
});

watchEffect(async () => {
    emitStartLoading();
    aggregateView.value = await DataService.fetchData<BehavioralDistanceData[]>('behave_dist', dataset.value);
    emitFinishLoading();
});


// changes current selected syllable based on area clicked in heatmap sends signal to store to run publishDataset method in mutations
function onHeatmapClick(event) {
    if (event.row) {
        dataview.value.selectedSyllable = Number.parseInt(event.row, 10);
    }
}
// Changes Row Order
function rowOrderChanged(event) {
    dataview.value.publishDataset({
        owner: props.id,
        name: 'Row Order',
        data: event,
    });
}
// Changes column Order
function colOrderChanged(event) {
    dataview.value.publishDataset({
        owner: props.id,
        name: 'Column Order',
        data: event,
    });
}
function heatmap_node_tooltip(item: any) {
    return `<div style="text-align:left;">
                Syllable: ${item.source} vs ${item.sink}<br />
                Distance: ${item.value?.toExponential(3)}
            </div>`;
}
</script>

<style scoped>

</style>