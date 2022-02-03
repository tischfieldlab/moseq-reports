<template>
    <component :is="render_mode"
        :width="this.layout.width"
        :height="this.layout.height"
        :data="this.aggregateView"
        :groupLabels="this.selectedGroups"
        :colorscale="this.settings.colormap"
        :vmin="this.settings.auto_vmin ? undefined : this.settings.vmin"
        :vmax="this.settings.auto_vmax ? undefined : this.settings.vmax"

        :columnOrderType="this.settings.column_order_type"
        :columnClusterDistance="this.settings.column_cluster_distance"
        :columnClusterLinkage="this.settings.column_cluster_linkage"
        :columnClusterK="this.settings.column_cluster_k"
        :columnOrderValue="this.settings.column_order_row_value"
        :columnOrderDirection="this.settings.column_order_direction"
        :columnLabelColor="columnLabelColors"

        :rowOrderType="this.settings.row_order_type"
        :rowClusterDistance="this.settings.row_cluster_distance"
        :rowClusterLinkage="this.settings.row_cluster_linkage"
        :rowClusterK="this.settings.row_cluster_k"
        :rowOrderValue="this.settings.row_order_column_value"
        :rowOrderDirection="this.settings.row_order_direction"
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
    <!--
        :columnOrderDataset="columnOrderDataset"
        :columnOrderValue=""
    -->
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
    friendly_name: 'Individual Usage Heatmap',
    component_type: 'IndividualUsageHeatmap',
    settings_type: 'IndividualUsageHeatmapOptions',
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.CANVAS, RenderMode.SVG],
    default_render_mode: RenderMode.CANVAS,
    default_settings: {
        ...get_colormap_options(),
        ...get_column_ordering_options(),
        ...get_row_ordering_options(),
        color_columns: true,
        color_columns_data: 'group',
    },
});


export default mixins(LoadingMixin, WindowMixin).extend({
    components: {
        ClusteredHeatmapCanvas,
        ClusteredHeatmapSVG,
    },
    data() {
        return {
            aggregateView: [] as any[],
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
        columnLabelColors(): object|undefined {
            if (this.settings.color_columns) {
                return Object.fromEntries(
                    this.aggregateView
                        .slice()
                        .map((itm) => {
                            return [
                                itm.uuid,
                                this.dataview.groupColors[this.dataview.selectedGroups.indexOf(itm.group)]
                            ];
                        }));
            } else {
                return undefined;
            }
        },
        //returns groups contained in aggregateView.
        selectedGroups(): string[] {
            return [...new Set(this.aggregateView.slice()
                                   .sort((a,b) => (a.group as string).localeCompare(b.group))
                                   .map((row) => row.uuid))];
        },
        //returns selected syllable, it can also change the selected syllable through signaling the store to commit the setSelectedSyllable mutation.
        selectedSyllable: {
            get(): number {
                return this.dataview.selectedSyllable;
            },
            set(event: number) {
                this.$store.commit(`${this.datasource}/setSelectedSyllable`, event);
            },
        },
        //returns  `this.dataview.countMethod` if changes occur to it.
        countMethod(): string {
            return this.dataview.countMethod;
        },
        //returns current order of dataset if changes occur to it.
        rowOrderDataset(): any[] {
            if (this.settings.row_order_dataset in this.dataview.views) {
                return this.dataview.views[this.settings.row_order_dataset].data;
            }
            return [];
        },
        dataset(): [string, Operation[]] {
            const syllables = this.$store.getters[`${this.datasource}/selectedSyllables`];
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
        //Reacts to changes in the dataset and returns new dataset.
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
        //changes current selected syllable.
        onHeatmapClick(event) {
            if (event.row) {
                this.selectedSyllable = Number.parseInt(event.row, 10);
            }
        },
        //changes row order by sending a signal to store to commit mutation publishDataset.
        rowOrderChanged(event) {
            this.$store.commit(`${this.datasource}/publishDataset`, {
                owner: this.id,
                name: 'Row Order',
                data: event,
            });
        },
        //changes column order by sending a signal to store to commit mutation publishDataset.
        colOrderChanged(event) {
            this.$store.commit(`${this.datasource}/publishDataset`, {
                owner: this.id,
                name: 'Column Order',
                data: event,
            });
        },
        //Gives UUID, Group, Module, and Usage current names based on the current data.
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
