<template>
    <ClusteredHeatmapSVG
        :width="this.layout.width"
        :height="this.layout.height - 31"
        :data="this.aggregateView"
        :groupLabels="this.selectedGroups"
        :colorscale="this.settings.colormap"

        :columnOrderType="this.settings.group_order_type"
        :columnClusterDistance="this.settings.group_cluster_distance"
        :columnClusterLinkage="this.settings.group_cluster_linkage"

        :rowOrderType="this.settings.syllable_order_type"
        :rowClusterDistance="this.settings.syllable_cluster_distance"
        :rowClusterLinkage="this.settings.syllable_cluster_linkage"
        :rowOrderValue="this.settings.syllable_order_group_value"
        :rowOrderDirection="this.settings.syllable_order_direction"
        :rowOrderDataset="rowOrderDataset"

        xAxisTitle="Group"
        :yAxisTitle="`Module ID (${countMethod})`"
        :legendTitle="`Usage (${countMethod})`"
        columnKey="group"
        rowKey="syllable"
        valueKey="usage"
        :selectedRow="selectedSyllable"
        @heatmapClick="onHeatmapClick"
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
import { OrderingType, SortOrderDirection } from '@/components/Charts/ClusteredHeatmap/ClusterHeatmap.types';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import { CountMethod } from '../../../store/dataview.types';
import { Operation } from '../../Core/DataLoader/DataLoader.types';


RegisterDataComponent({
    friendly_name: 'Usage Heatmap',
    component_type: 'UsageHeatmap',
    settings_type: 'UsageHeatmapOptions',
    init_width: 400,
    init_height: 500,
    default_settings: {
        syllable_order_type: OrderingType.Cluster,
        syllable_order_group_value: undefined,
        syllable_order_direction: SortOrderDirection.Asc,
        syllable_cluster_distance: 'euclidean',
        syllable_cluster_linkage: 'avg',
        group_order_type: OrderingType.Natural,
        group_cluster_distance: 'euclidean',
        group_cluster_linkage: 'avg',
        colormap: 'interpolateViridis',
    },
});


export default mixins(LoadingMixin, WindowMixin).extend({
    components: {
        ClusteredHeatmapSVG,
    },
    data() {
        return {
            aggregateView: [],
        };
    },
    computed: {
        selectedGroups(): string[] {
            return this.dataview.selectedGroups;
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
        rowOrderDataset(): any[] {
            if (this.settings.syllable_order_dataset in this.dataview.views) {
                return this.dataview.views[this.settings.syllable_order_dataset].data;
            }
            return [];
        },
        dataset(): [string, Operation[]] {
            let syllables;
            if (this.dataview.moduleIdFilter.length === 0) {
                syllables = this.$store.getters[`${this.datasource}/availableModuleIds`];
            } else {
                syllables = this.dataview.moduleIdFilter;
            }
            return [
                this.$store.getters[`datasets/resolve`]('usage'),
                [
                    {
                        type: 'map',
                        columns: [
                            [`usage_${this.countMethod.toLowerCase()}`, 'usage'],
                            ['group', 'group'],
                            [`id_${this.countMethod.toLowerCase()}`, 'syllable'],
                        ],
                    },
                    {
                        type: 'filter',
                        filters: {
                            group: this.dataview.selectedGroups,
                            syllable: syllables,
                        },
                    },
                    {
                        type: 'aggregate',
                        groupby: ['syllable', 'group'],
                        aggregate: {
                            usage: 'mean',
                        },
                    },
                ],
            ];
        },
    },
    watch: {
        dataset: {
            handler(): any {
                LoadData(this.dataset[0], this.dataset[1])
                .then((data) => this.aggregateView = data);
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
