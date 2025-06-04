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
        :columnOrderDataset="columnOrderDataset"

        :rowOrderType="settings.row_order_type"
        :rowClusterDistance="settings.row_cluster_distance"
        :rowClusterLinkage="settings.row_cluster_linkage"
        :rowClusterK="settings.row_cluster_k"
        :rowOrderValue="settings.row_order_column_value"
        :rowOrderDirection="settings.row_order_direction"
        :rowOrderDataset="rowOrderDataset"

        xAxisTitle="Group"
        :yAxisTitle="`Syllable ID (${countMethod})`"
        :legendTitle="`Usage (${countMethod})`"
        columnKey="group"
        rowKey="syllable"
        valueKey="usage"
        :selectedRow="selectedSyllable"
        @heatmap-click="onHeatmapClick"
        @row-order-changed="rowOrderChanged"
        @col-order-changed="colOrderChanged"
    />
</template>


<script lang="ts">
import {defineComponent, computed, shallowRef, watch} from 'vue';
import RegisterDataComponent from '@render/components/Core';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import DataService, { Operation } from '@api';
import { RenderMode } from '@store/datawindow.types';
import {ClusteredHeatmapSVG, ClusteredHeatmapCanvas, ColormapSettings, ColormapSettingsDefaults, ColumnOrderingSettings, ColumnOrderingSettingsDefaults, RowOrderingSettings, RowOrderingSettingsDefaults } from '@render/components/Charts/ClusteredHeatmap';


export type UsageHeatmapSettings = ColormapSettings & ColumnOrderingSettings & RowOrderingSettings;

RegisterDataComponent({
    friendly_name: 'Usage Heatmap',
    component_type: 'UsageHeatmap',
    settings_type: 'UsageHeatmapOptions',
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.SVG, RenderMode.CANVAS],
    default_render_mode: RenderMode.SVG,
    default_settings: {
        ...ColormapSettingsDefaults(),
        ...ColumnOrderingSettingsDefaults(),
        ...RowOrderingSettingsDefaults(),
    },
});


export default defineComponent({
    components: {
        ClusteredHeatmapSVG,
        ClusteredHeatmapCanvas,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const {$wstate, dataview, settings, layout} = useWindowMixin<UsageHeatmapSettings>(props.id)
        const aggregateView = shallowRef<any[]>([]);

        const render_mode = computed(() => {
            if ($wstate.render_mode === RenderMode.CANVAS) {
                return 'ClusteredHeatmapCanvas';
            } else if ($wstate.render_mode === RenderMode.SVG) {
                return 'ClusteredHeatmapSVG';
            } else {
                // tslint:disable-next-line:no-console
                console.error('invalid render mode', $wstate.render_mode);
                return 'ClusteredHeatmapSVG';
            }
        });
        const selectedGroups = computed(() => {
            return dataview.value.selectedGroups;
        });
        const selectedSyllable = computed({
            get(): number {
                return dataview.value.selectedSyllable;
            },
            set(event: number) {
                dataview.value.selectedSyllable = event;
            },
        });
        const countMethod = computed(() => {
            return dataview.value.countMethod;
        });
        const rowOrderDataset = computed(() => {
            if ($wstate.settings.row_order_dataset in dataview.value.views) {
                return dataview.value.views[$wstate.settings.row_order_dataset].data;
            }
            return [];
        });
        const columnOrderDataset = computed(() => {
            if ($wstate.settings.column_order_dataset in dataview.value.views) {
                return dataview.value.views[$wstate.settings.column_order_dataset].data;
            }
            return [];
        });
        const dataset = computed<Operation[]>(() => {
            return [{
                type: 'map',
                columns: [
                    [`usage_${dataview.value.countMethod.toLowerCase()}`, 'usage'],
                    ['group', 'group'],
                    [`id_${dataview.value.countMethod.toLowerCase()}`, 'syllable'],
                ],
            }, {
                type: 'filter',
                filters: {
                    group: dataview.value.selectedGroups,
                    syllable: dataview.value.selectedSyllables,
                },
            }, {
                type: 'aggregate',
                groupby: ['syllable', 'group'],
                aggregate: {
                    usage: 'mean',
                },
            }];
        });

        function onHeatmapClick(event) {
            if (event.row) {
                selectedSyllable.value = Number.parseInt(event.row, 10);
            }
        }
        function rowOrderChanged(event) {
            dataview.value.publishDataset({
                owner: props.id,
                name: 'Row Order',
                data: event,
            });
        }
        function colOrderChanged(event) {
            dataview.value.publishDataset({
                owner: props.id,
                name: 'Column Order',
                data: event,
            });
        }
        /*
        heatmap_node_tooltip(item: HeatmapTile) {
            return `<div style="text-align:left;">
                        Group: ${item.group}<br />
                        Syllable: ${item.syllable}<br />
                        Usage: ${item.usage.toExponential(3)}
                    </div>`;
        },
        */


        watch(dataset, (newValue) => {
            DataService.fetchData<any[]>("usage", newValue)
                .then((data) => {
                    aggregateView.value = data;
                })
                .catch((error) => {
                    console.error('Error loading data:', error);
                });
        }, { immediate: true });

        return {
            render_mode,
            aggregateView,
            selectedGroups,
            selectedSyllable,
            countMethod,
            rowOrderDataset,
            columnOrderDataset,
            dataset,
            settings,
            layout,
            onHeatmapClick,
            rowOrderChanged,
            colOrderChanged,
        };

    },
});
</script>

<style scoped>

</style>