<template>
    <component
        :is="render_mode"
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
        :columnOrderDataset="columnOrderDataset"
        :rowOrderType="this.settings.row_order_type"
        :rowClusterDistance="this.settings.row_cluster_distance"
        :rowClusterLinkage="this.settings.row_cluster_linkage"
        :rowClusterK="this.settings.row_cluster_k"
        :rowOrderValue="this.settings.row_order_column_value"
        :rowOrderDirection="this.settings.row_order_direction"
        :rowOrderDataset="rowOrderDataset"
        xAxisTitle="Group"
        :yAxisTitle="`Module ID (${countMethod})`"
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
import Vue from "vue";
import RegisterDataComponent from "../../../components/Core";
import LoadingMixin from "../../../components/Core/LoadingMixin";
import mixins from "vue-typed-mixins";
import WindowMixin from "../../../components/Core/Window/WindowMixin";
import {
    ClusteredHeatmapSVG,
    ClusteredHeatmapCanvas,
} from "../../../components/Charts/ClusteredHeatmap";
import LoadData from "../../../components/Core/DataLoader/DataLoader";
import { Operation } from "../../Core/DataLoader/DataLoader.types";
import { RenderMode } from "../../../store/datawindow.types";
import {
    get_column_ordering_options,
    get_colormap_options,
    get_row_ordering_options,
} from "../../../components/Charts/ClusteredHeatmap/Options";

RegisterDataComponent({
    friendly_name: "Usage Heatmap",
    component_type: "UsageHeatmap",
    settings_type: "UsageHeatmapOptions",
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.SVG, RenderMode.CANVAS],
    default_render_mode: RenderMode.SVG,
    default_settings: {
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
            aggregateView: [],
        };
    },
    computed: {
        render_mode(): string {
            if (this.$wstate.render_mode === RenderMode.CANVAS) {
                return "ClusteredHeatmapCanvas";
            } else if (this.$wstate.render_mode === RenderMode.SVG) {
                return "ClusteredHeatmapSVG";
            } else {
                // tslint:disable-next-line:no-console
                console.error("invalid render mode", this.$wstate.render_mode);
                return "ClusteredHeatmapSVG";
            }
        },
        selectedGroups(): string[] {
            return this.dataview.selectedGroups;
        },
        selectedSyllable: {
            get(): number {
                return this.dataview.selectedSyllable;
            },
            set(event: number) {
                this.$store.commit(
                    `${this.datasource}/setSelectedSyllable`,
                    event
                );
            },
        },
        countMethod(): string {
            return this.dataview.countMethod;
        },
        rowOrderDataset(): any[] {
            if (this.settings.row_order_dataset in this.dataview.views) {
                return this.dataview.views[this.settings.row_order_dataset]
                    .data;
            }
            return [];
        },
        columnOrderDataset(): any[] {
            if (this.settings.column_order_dataset in this.dataview.views) {
                return this.dataview.views[this.settings.column_order_dataset]
                    .data;
            }
            return [];
        },
        dataset(): [string, Operation[]] {
            const syllables =
                this.$store.getters[`${this.datasource}/selectedSyllables`];
            return [
                this.$store.getters[`datasets/resolve`]("usage"),
                [
                    {
                        type: "map",
                        columns: [
                            [
                                `usage_${this.countMethod.toLowerCase()}`,
                                "usage",
                            ],
                            ["group", "group"],
                            [
                                `id_${this.countMethod.toLowerCase()}`,
                                "syllable",
                            ],
                        ],
                    },
                    {
                        type: "filter",
                        filters: {
                            group: this.dataview.selectedGroups,
                            syllable: syllables,
                        },
                    },
                    {
                        type: "aggregate",
                        groupby: ["syllable", "group"],
                        aggregate: {
                            usage: "mean",
                        },
                    },
                ],
            ];
        },
    },
    watch: {
        dataset: {
            handler(): any {
                LoadData(this.dataset[0], this.dataset[1]).then(
                    (data) => (this.aggregateView = data)
                );
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
                name: "Row Order",
                data: event,
            });
        },
        colOrderChanged(event) {
            this.$store.commit(`${this.datasource}/publishDataset`, {
                owner: this.id,
                name: "Column Order",
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

<style scoped></style>
