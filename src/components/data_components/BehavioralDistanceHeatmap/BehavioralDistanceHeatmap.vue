<template>
    <component :is="render_mode"
        :width="this.layout.width"
        :height="this.layout.height"
        :data="this.aggregateView"
        :groupLabels="this.includeSyllables"
        :colorscale="this.settings.colormap"
        :vmin="this.settings.auto_vmin ? undefined : this.settings.vmin"
        :vmax="this.settings.auto_vmax ? undefined : this.settings.vmax"

        :columnOrderType="this.settings.column_order_type"
        :columnClusterDistance="this.settings.column_cluster_distance"
        :columnClusterLinkage="this.settings.column_cluster_linkage"
        :columnClusterK="this.settings.column_cluster_k"
        :columnOrderValue="this.settings.column_order_row_value"
        :columnOrderDirection="this.settings.column_order_direction"
        :columnOrderDataset="rowOrderDataset"

        :rowOrderType="this.settings.row_order_type"
        :rowClusterDistance="this.settings.row_cluster_distance"
        :rowClusterLinkage="this.settings.row_cluster_linkage"
        :rowClusterK="this.settings.row_cluster_k"
        :rowOrderValue="this.settings.row_order_column_value"
        :rowOrderDirection="this.settings.row_order_direction"
        :rowOrderDataset="rowOrderDataset"

        :xAxisTitle="`Destination Module (${countMethod})`"
        :yAxisTitle="`Source Module (${countMethod})`"
        :legendTitle="`Behavioral Distance (${this.settings.distance_metric})`"
        columnKey="sink"
        rowKey="source"
        valueKey="value"
        :selectedRow="selectedSyllable"
        @heatmap-click="onHeatmapClick"
        @row-order-changed="rowOrderChanged"
        @col-order-changed="colOrderChanged"
        :tooltipFormatter="heatmap_node_tooltip"
    />
    <!--:columnOrderValue=""   -->
</template>


<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/Core';
import LoadingMixin from '@/components/Core/LoadingMixin';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/Window/WindowMixin';
import {ClusteredHeatmapSVG, ClusteredHeatmapCanvas } from '@/components/Charts/ClusteredHeatmap';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import { Operation } from '../../Core/DataLoader/DataLoader.types';
import { RenderMode } from '@/store/datawindow.types';
import {get_column_ordering_options, get_colormap_options, get_row_ordering_options} from '@/components/Charts/ClusteredHeatmap/Options';


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
        ...get_colormap_options(),
        ...get_column_ordering_options(),
        ...get_row_ordering_options(),
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
        includeSyllables(): any[] {
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
            const ds = this.$store.getters[`datasets/resolve`]('behave_dist');

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
                        type: 'map',
                        columns: [
                            [`row_id_${this.countMethod.toLowerCase()}`, 'source'],
                            [`col_id_${this.countMethod.toLowerCase()}`, 'sink'],
                            [this.settings.distance_metric, 'value'],
                        ],
                    },
                ],
            ];
        },
    },
    watch: {
        dataset: {
            handler(): any {
                LoadData(this.dataset[0], this.dataset[1])
                .then((data) => {
                    return data.filter((v) => {
                        return this.includeSyllables.includes(v.source)
                            && this.includeSyllables.includes(v.sink);
                    });
                })
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
        heatmap_node_tooltip(item: any) {
            return `<div style="text-align:left;">
                        Module: ${item.source} vs ${item.sink}<br />
                        Distance: ${item.value?.toExponential(3)}
                    </div>`;
        },
    },
});
</script>

<style scoped>

</style>
