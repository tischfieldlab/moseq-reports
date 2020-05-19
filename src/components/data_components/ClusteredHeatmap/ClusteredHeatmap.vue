<template>
    <ClusteredHeatmap
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
        xAxisTitle="Group"
        :yAxisTitle="`Module ID (${countMethod})`"
        :legendTitle="`Usage (${countMethod})`"
        columnKey="group"
        rowKey="syllable"
        valueKey="usage"
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
import ClusteredHeatmap from '@/components/Charts/ClusteredHeatmap/ClusteredHeatmap.vue';
import { OrderingType, SortOrderDirection } from '@/components/Charts/ClusteredHeatmap/ClusterHeatmap.types';


RegisterDataComponent({
    friendly_name: 'Clustered Usage Heatmap',
    component_type: 'ClusteredHeatmap',
    settings_type: 'ClusteredHeatmapOptions',
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
        ClusteredHeatmap,
    },
    data() {
        return {};
    },
    computed: {
        selectedGroups(): string[] {
            return this.dataview.selectedGroups;
        },
        aggregateView(): any {
            const v = this.$store.getters[`${this.datasource}/aggregateView`];
            if (v !== null) {
                return v.toCollection();
            } else {
                return null;
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
    },
    methods: {
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
