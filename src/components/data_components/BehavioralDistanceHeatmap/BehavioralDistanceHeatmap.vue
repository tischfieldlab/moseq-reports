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
        :xAxisTitle="`Destination Module (${countMethod})`"
        :yAxisTitle="`Source Module (${countMethod})`"
        :legendTitle="`Behavioral Distance`"
        columnKey="sink"
        rowKey="source"
        valueKey="value"
        :selectedRow="selectedSyllable"
        @heatmapClick="onHeatmapClick"
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
    friendly_name: 'Behavioral Distance Heatmap',
    component_type: 'BehavioralDistanceHeatmap',
    settings_type: 'BehavioralDistanceHeatmapOptions',
    init_width: 400,
    init_height: 500,
    default_settings: {
        syllable_order_type: OrderingType.Cluster,
        syllable_order_group_value: undefined,
        syllable_order_direction: SortOrderDirection.Asc,
        syllable_cluster_distance: 'euclidean',
        syllable_cluster_linkage: 'avg',
        group_order_type: OrderingType.Cluster,
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
            aggregateView: [] as Readonly<any[]>,
        };
    },
    computed: {
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
                        column: 'ar[init]',
                    }
                ],
            ];
        },
    },
    watch: {
        dataset: {
            handler(): any {
                LoadData(this.dataset[0], this.dataset[1], true)
                .then((data: number[][]) => {
                    return data.flatMap((vals, sidx) => {
                        return vals.map((value, didx) => {
                            return {
                                source: sidx,
                                sink: didx,
                                value: value,
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
