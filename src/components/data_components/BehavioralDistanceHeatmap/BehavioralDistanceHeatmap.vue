<template>
    <ClusteredHeatmapCanvas
        :width="this.layout.width"
        :height="this.layout.height - 31"
        :data="this.aggregateView"
        :groupLabels="this.selectedGroups"
        :colorscale="this.settings.colormap"

        :columnOrderType="this.settings.column_order_type"
        :columnClusterDistance="this.settings.column_cluster_distance"
        :columnClusterLinkage="this.settings.column_cluster_linkage"
        :columnOrderValue="this.settings.column_order_row_value"
        :columnOrderDirection="this.settings.column_order_direction"
        :columnOrderDataset="rowOrderDataset"

        :rowOrderType="this.settings.row_order_type"
        :rowClusterDistance="this.settings.row_cluster_distance"
        :rowClusterLinkage="this.settings.row_cluster_linkage"
        :rowOrderValue="this.settings.row_order_col_value"
        :rowOrderDirection="this.settings.row_order_direction"
        :rowOrderDataset="rowOrderDataset"

        :xAxisTitle="`Destination Module (${countMethod})`"
        :yAxisTitle="`Source Module (${countMethod})`"
        :legendTitle="`Behavioral Distance`"
        columnKey="sink"
        rowKey="source"
        valueKey="value"
        :selectedRow="selectedSyllable"
        @heatmap-click="onHeatmapClick"
        @row-order-changed="rowOrderChanged"
        @col-order-changed="colOrderChanged"
    />
    <!--:columnOrderValue=""   -->
</template>


<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/Core';
import LoadingMixin from '@/components/Core/LoadingMixin';
import { unnest } from '@/util/Vuex';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';
import ClusteredHeatmapSVG from '@/components/Charts/ClusteredHeatmap/ClusteredHeatmapSVG.vue';
import ClusteredHeatmapCanvas from '@/components/Charts/ClusteredHeatmap/ClusteredHeatmapCanvas.vue';

import { OrderingType, SortOrderDirection } from '@/components/Charts/ClusteredHeatmap/ClusterHeatmap.types';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import { CountMethod } from '../../../store/dataview.types';
import { Operation } from '../../Core/DataLoader/DataLoader.types';


RegisterDataComponent({
    friendly_name: 'Behavioral Distance Heatmap',
    component_type: 'BehavioralDistanceHeatmap',
    settings_type: 'BehavioralDistanceHeatmapOptions',
    init_width: 400,
    init_height: 500,
    default_settings: {
        distance_metric: 'ar[init]',
        row_order_type: OrderingType.Cluster,
        row_order_col_value: undefined,
        row_order_direction: SortOrderDirection.Asc,
        row_cluster_distance: 'euclidean',
        row_cluster_linkage: 'avg',
        column_order_type: OrderingType.Cluster,
        column_cluster_distance: 'euclidean',
        column_cluster_linkage: 'avg',
        colormap: 'interpolateViridis',
    },
});


export default mixins(LoadingMixin, WindowMixin).extend({
    components: {
        ClusteredHeatmapSVG,
        ClusteredHeatmapCanvas,
    },
    data() {
        return {
            aggregateView: [] as Readonly<any[]>,
        };
    },
    computed: {
        rowOrderDataset(): any[] {
            if (this.settings.row_order_dataset in this.dataview.views) {
                return this.dataview.views[this.settings.row_order_dataset].data;
            }
            return [];
        },
        columnOrderDataset(): any[] {
            if (this.settings.column_order_dataset in this.dataview.views) {
                return this.dataview.views[this.settings.column_order_dataset].data;
            }
            return [];
        },
        selectedGroups(): any[] {
            if (this.dataview.moduleIdFilter.length === 0) {
                return this.$store.getters[`${this.datasource}/availableModuleIds`];
            } else {
                return this.dataview.moduleIdFilter;
            }
        },
        selectedSyllable: {
            get(): number {
                return this.dataview.selectedSyllable;
            },
            set(event: number) {
                this.$store.commit(`${this.datasource}/setSelectedSyllable`, event);
            },
        },
        countMethod(): string {
            return this.dataview.countMethod;
        },
        dataset(): [string, Operation[]] {
            let ds;
            if (this.countMethod === CountMethod.Usage) {
                ds = this.$store.getters[`datasets/resolve`]('behave_dist_usage');
            } else if (this.countMethod === CountMethod.Frames) {
                ds = this.$store.getters[`datasets/resolve`]('behave_dist_frames');
            } else {
                throw new Error(`Count method ${this.countMethod} is not supported`);
            }
            let syllables;
            if (this.dataview.moduleIdFilter.length === 0) {
                syllables = this.$store.getters[`${this.datasource}/availableModuleIds`];
            } else {
                syllables = this.dataview.moduleIdFilter;
            }
            return [
                ds,
                [
                    {
                        type: 'pluck',
                        column: this.settings.distance_metric,
                    },
                ],
            ];
        },
    },
    watch: {
        dataset: {
            handler(): any {
                LoadData(this.dataset[0], this.dataset[1])
                .then((data: number[][]) => {
                    return data.flatMap((vals, sidx) => {
                        return vals.map((value, didx) => {
                            return {
                                source: sidx,
                                sink: didx,
                                value,
                            };
                        });
                    });
                })
                .then((data) => {
                    return data.filter((v) => {
                        return this.selectedGroups.includes(v.source)
                            && this.selectedGroups.includes(v.sink);
                    });
                })
                // .then((data) => { console.log(data); return data;})
                .then((data) => this.aggregateView = Object.freeze(data));
            },
            immediate: true,
        },
    },
    methods: {
        onHeatmapClick(event) {
            if (event.row) {
                this.selectedSyllable = Number.parseInt(event.row, 10);
            }
        },
        rowOrderChanged(event) {
            this.$store.commit(`${this.datasource}/publishDataset`, {
                owner: this.id,
                name: 'Row Order',
                data: event,
            });
        },
        colOrderChanged(event) {
            this.$store.commit(`${this.datasource}/publishDataset`, {
                owner: this.id,
                name: 'Column Order',
                data: event,
            });
        },
        /*
        heatmap_node_tooltip(item: HeatmapTile) {
            return `<div style="text-align:left;">
                        Group: ${item.group}<br />
                        Module: ${item.syllable}<br />
                        Usage: ${item.usage.toExponential(3)}
                    </div>`;
        },
        */
    },
});
</script>

<style scoped>

</style>
