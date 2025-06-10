<template>
    <component :is="render_mode"
        :width="layout.width"
        :height="layout.height"
        :data="normalizedAggregateView"
        :groupLabels="includeSyllables"
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
        :legendTitle="`Transition Probability (${settings.normalization} Normalized)`"
        columnKey="col_id"
        rowKey="row_id"
        valueKey="raw"
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
    friendly_name: 'Transitions Heatmap',
    component_type: 'TransitionsHeatmap',
    settings_type: 'TransitionsHeatmapOptions',
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.CANVAS, RenderMode.SVG],
    default_render_mode: RenderMode.CANVAS,
    default_settings: {
        mode: TransitionsHeatmapMode.Overall,
        selected_group: '',
        normalization: TransitionsNormalization.Bigram,
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
import DataService, {Operation} from '@render/api';
import RegisterDataComponent from '@render/components/Core';
import { TransitionsHeatmapMode, TransitionsHeatmapSettings, TransitionsNormalization } from './TransitionsHeatmap.types';

export interface TransData {
    group: string;
    row_id: number;
    col_id: number;
    raw: number;
}

const props = defineProps<{
    id: string;
}>();

const {$wstate, dataview, layout, settings} = useWindowMixin<TransitionsHeatmapSettings>(props.id);

const aggregateView = shallowRef<TransData[]>([]);
const normalizedAggregateView = shallowRef<TransData[]>([]);


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
const includeSyllables = computed((): any[] => {
    if (dataview.value.moduleIdFilter.length === 0) {
        return dataview.value.availableModuleIds;
    } else {
        return dataview.value.moduleIdFilter;
    }
});

const dataset = computed((): Operation[] =>{
    let syllables;
    if (dataview.value.moduleIdFilter.length === 0) {
        syllables = dataview.value.availableModuleIds;
    } else {
        syllables = dataview.value.moduleIdFilter;
    }
    const ops: Operation[] = [
        {
            type: 'map',
            columns: [
                ['default_group', 'group'],
                [`row_id_${dataview.value.countMethod.toLowerCase()}`, 'row_id'],
                [`col_id_${dataview.value.countMethod.toLowerCase()}`, 'col_id'],
                'raw',
            ]
        }];
    if ($wstate.settings.mode === TransitionsHeatmapMode.Overall) {
        // no filtering needed, we want all data
    } else if ($wstate.settings.mode === TransitionsHeatmapMode.SingleGroup) {
        ops.push({
            type: 'filter',
            filters: {
                group: [$wstate.settings.selected_group],
            },
        });

    } else {
        console.error('Invalid TransitionsHeatmapMode', $wstate.settings.mode);
    }

    ops.push({
        type: 'aggregate',
        groupby: [
            'row_id',
            'col_id',
        ],
        aggregate: {
            raw: 'sum'
        },
    });
    return ops;
});

function BigramNormalize(data: TransData[]): TransData[] {
    const normalized: TransData[] = [];
    const total = data.reduce((acc, curr) => acc + curr.raw, 0);
    for (const item of data) {
        const new_item = {...item};
        new_item.raw = total > 0 ? item.raw / total : 0;
        normalized.push(new_item);
    }
    return normalized;
}

function RowNormalize(data: TransData[]): TransData[] {
    const normalized: TransData[] = [];
    const total = data.reduce<{[key: number]: number}>((acc, curr) => {
        if (!acc[curr.row_id]) {
            acc[curr.row_id] = 0;
        }
        acc[curr.row_id] += curr.raw
        return acc;
    }, {});
    for (const item of data) {
        const new_item = {...item};
        new_item.raw = total[item.row_id] > 0 ? item.raw / total[item.row_id] : 0;
        normalized.push(new_item);
    }
    return normalized;
}

function ColumnNormalize(data: TransData[]): TransData[] {
    const normalized: TransData[] = [];
    const total = data.reduce<{[key: number]: number}>((acc, curr) => {
        if (!acc[curr.col_id]) {
            acc[curr.col_id] = 0;
        }
        acc[curr.col_id] += curr.raw
        return acc;
    }, {});
    for (const item of data) {
        const new_item = {...item};
        new_item.raw = total[item.col_id] > 0 ? item.raw / total[item.col_id] : 0;
        normalized.push(new_item);
    }
    return normalized;
}

watchEffect(async () => {
    aggregateView.value = await DataService.fetchData<TransData[]>('transitions', dataset.value);
});

watchEffect(() => {
    const data = aggregateView.value;
    if ($wstate.settings.normalization === TransitionsNormalization.Bigram) {
        normalizedAggregateView.value = BigramNormalize(data);
    } else if ($wstate.settings.normalization === TransitionsNormalization.Rows) {
        normalizedAggregateView.value = RowNormalize(data);
    } else if ($wstate.settings.normalization === TransitionsNormalization.Columns) {
        normalizedAggregateView.value = ColumnNormalize(data);
    } else {
        console.error('Invalid TransitionsNormalization', $wstate.settings.normalization);
    }
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
function heatmap_node_tooltip(item: TransData) {
    return `<div style="text-align:left;">
                Transition: ${item.row_id} → ${item.col_id}<br />
                TP: ${item.raw?.toExponential(3)}
            </div>`;
}
</script>

<style scoped>

</style>