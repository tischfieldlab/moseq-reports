<template>
    <component :is="render_mode"
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

        xAxisTitle="Individual"
        :yAxisTitle="`Module ID (${countMethod})`"
        :legendTitle="`Usage (${countMethod})`"
        columnKey="uuid"
        rowKey="syllable"
        valueKey="usage"
        :selectedRow="selectedSyllable"
        @heatmap-click="onHeatmapClick"
        @row-order-changed="rowOrderChanged"
        @col-order-changed="colOrderChanged"
        :tooltipFormatter="heatmap_node_tooltip"
    />
    <!--:columnOrderValue=""   -->
</template>


<script lang="ts">
import RegisterDataComponent from '@/components/Core';
import LoadingMixin from '@/components/Core/LoadingMixin';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';
import ClusteredHeatmapCanvas from '@/components/Charts/ClusteredHeatmap/ClusteredHeatmapCanvas.vue';
import ClusteredHeatmapSVG from '@/components/Charts/ClusteredHeatmap/ClusteredHeatmapSVG.vue';
import { OrderingType, SortOrderDirection } from '@/components/Charts/ClusteredHeatmap/ClusterHeatmap.types';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import { Operation } from '../../Core/DataLoader/DataLoader.types';
import { RenderMode } from '@/store/datawindow.types';


RegisterDataComponent({
    friendly_name: 'Individual Usage Heatmap',
    component_type: 'IndividualUsageHeatmap',
    settings_type: 'IndividualUsageHeatmapOptions',
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.CANVAS, RenderMode.SVG],
    default_render_mode: RenderMode.CANVAS,
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
        ClusteredHeatmapCanvas,
        ClusteredHeatmapSVG,
    },
    data() {
        return {
            aggregateView: [] as Array<any>,
        };
    },
    computed: {
        render_mode(): string {
            if (this.$wstate.render_mode === RenderMode.CANVAS) {
                return 'ClusteredHeatmapCanvas';
            } else if (this.$wstate.render_mode === RenderMode.SVG) {
                return 'ClusteredHeatmapSVG';
            } else {
                // tslint:disable-next-line:no-console
                console.error('invalid render mode', this.$wstate.render_mode);
                return 'ClusteredHeatmapSVG';
            }
        },
        selectedGroups(): Array<string> {
            return [...new Set(this.aggregateView.slice()
                                   .sort((a, b) => (a.group as string).localeCompare(b.group))
                                   .map((row) => row.uuid))];
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
        rowOrderDataset(): Array<any> {
            if (this.settings.syllable_order_dataset in this.dataview.views) {
                return this.dataview.views[this.settings.syllable_order_dataset].data;
            }
            return [];
        },
        dataset(): [string, Array<Operation>] {
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
                            ['uuid', 'uuid'],
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
                ],
            ];
        },
    },
    watch: {
        dataset: {
            handler(): any {
                LoadData(this.dataset[0], this.dataset[1], false)
                    .then((data) => {
                        data.forEach((itm) => { itm.uuid = itm.uuid.split('-').pop(); });
                        return data;
                    })
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
        heatmap_node_tooltip(item: any) {
            return `<div style="text-align:left;">
                        UUID: ${item.uuid}<br />
                        Group: ${item.group}<br />
                        Module: ${item.syllable}<br />
                        Usage: ${item.usage.toExponential(3)}
                    </div>`;
        },
    },
});
</script>

<style scoped>

</style>
