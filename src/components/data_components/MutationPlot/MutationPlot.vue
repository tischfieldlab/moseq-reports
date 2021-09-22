<template>
    <component :is="render_mode"
        :width="this.layout.width"
        :height="this.layout.height - 31"
        :data="aggregateView"
        varKey="syllable"
        valueKey="value"
        seriesKey="group"
        :errorKey="settings.error_type"
        :showError="settings.show_errors"
        :varOrdering="syllable_ordering"
        :seriesLabels="groupNames"
        :seriesColors="groupColors"
        :showPoints="settings.show_points"
        :pointSize="settings.point_size"
        :showLines="settings.show_lines"
        :lineWeight="settings.line_weight"
        xAxisTitle="Module ID"
        :yAxisTitle="`Module Usage (${countMethod})`"
        :tooltipFormatter="format_tooltip"
        @lineplot-click="onLineplotClick"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/Core';
import LoadingMixin from '@/components/Core/LoadingMixin';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/Window/WindowMixin';

import { LinePlotSVG, LinePlotCanvas} from '@/components/Charts/LinePlot';


import LoadData from '@/components/Core/DataLoader/DataLoader';
import {OrderingType, SortOrderDirection} from '@/components/Charts/ClusteredHeatmap';
import { Operation } from '../../Core/DataLoader/DataLoader.types';
import { RenderMode } from '@/store/datawindow.types';



RegisterDataComponent({
    friendly_name: 'Mutation Plot',
    component_type: 'MutationPlot',
    settings_type: 'MutationPlotOptions',
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.SVG, RenderMode.CANVAS],
    default_render_mode: RenderMode.SVG,
    default_settings: {
        show_points: true,
        point_size: 4,
        show_lines: true,
        line_weight: 3,
        show_errors: true,
        error_type: 'sem',
        group_order_type: OrderingType.Natural,
        syllable_order_type: OrderingType.Natural,
        syllable_order_group_value: undefined,
        syllable_order_direction: SortOrderDirection.Dec,
        syllable_order_dataset: undefined,
        syllable_order_diff_minuend: undefined,
        syllable_order_diff_subtrahend: undefined,
    },
});


interface PlotData {
    group: string;
    syllable: string;
    value: number;
    count: number;
    deviation: number;
    sem: number;
    ci95: number
}


export default mixins(LoadingMixin, WindowMixin).extend({
    components: {
        LinePlotSVG,
        LinePlotCanvas,
    },
    data() {
        return {
            aggregateView: [] as PlotData[],
        };
    },
    watch: {
        dataset: {
            handler(): void {
                this.prepareData();
            },
            immediate: true,
        },
    },
    computed: {
        render_mode(): string {
            if (this.$wstate.render_mode === RenderMode.CANVAS) {
                return 'LinePlotCanvas';
            } else if (this.$wstate.render_mode === RenderMode.SVG) {
                return 'LinePlotSVG';
            } else {
                // tslint:disable-next-line:no-console
                console.error('invalid render mode', this.$wstate.render_mode);
                return 'LinePlotSVG';
            }
        },
        syllable_ordering(): any[] {
            if (this.settings.syllable_order_type === OrderingType.Natural) {
                return this.$store.getters[`${this.datasource}/selectedSyllables`];
            } else if (this.settings.syllable_order_type === OrderingType.Dataset) {
                if (this.dataview.views[this.settings.syllable_order_dataset] !== undefined) {
                    return this.dataview.views[this.settings.syllable_order_dataset].data.map((d) => Number.parseInt(d, 10));
                }
            } else if (this.settings.syllable_order_type === OrderingType.Value) {
                return this.aggregateView
                            .filter((u) => u.group === this.settings.syllable_order_group_value.toString())
                            .sort((a, b) => {
                                if (this.settings.syllable_order_direction === SortOrderDirection.Dec) {
                                    return b.value - a.value;
                                } else {
                                    return a.value - b.value;
                                }
                            })
                            .map((u) => u.syllable);
            } else if (this.settings.syllable_order_type === OrderingType.Computed) {
                const syllables = this.$store.getters[`${this.datasource}/selectedSyllables`];
                const minData = this.aggregateView.filter((u) => u.group === this.settings.syllable_order_diff_minuend.toString());
                const subData = this.aggregateView.filter((u) => u.group === this.settings.syllable_order_diff_subtrahend.toString());

                return syllables.map((s) => {
                    const min = minData.find((p) => p.syllable === s)?.value || 0;
                    const sub = subData.find((p) => p.syllable === s)?.value || 0;
                    return {
                        syllable: s,
                        value: min - sub,
                    };
                }).sort((a, b) => {
                    if (this.settings.syllable_order_direction === SortOrderDirection.Dec) {
                        return b.value - a.value;
                    } else {
                        return a.value - b.value;
                    }
                })
                .map((u) => u.syllable);
            }else {
                // tslint:disable-next-line:no-console
                console.warn(`Unsupported group order type ${this.settings.syllable_order_type}`);
            }
            return [];
        },
        countMethod(): string {
            return this.dataview.countMethod;
        },
        errorType(): string {
            return this.settings.error_type;
        },
        selectedSyllable: {
            get(): number {
                return this.dataview.selectedSyllable;
            },
            set(event: number) {
                this.$store.commit(`${this.datasource}/setSelectedSyllable`, event);
            },
        },
        groupNames(): string[] {
            if (this.settings.group_order_type === OrderingType.Natural) {
                return this.dataview.selectedGroups;
            } else if (this.settings.group_order_type === OrderingType.Dataset) {
                if (this.dataview.views[this.settings.group_order_dataset] !== undefined) {
                    return this.dataview.views[this.settings.group_order_dataset].data
                }
            } else {
                // tslint:disable-next-line:no-console
                console.warn(`Unsupported group order type ${this.settings.group_order_type}`);
            }
            return [];
        },
        groupColors(): string[] {
            return this.groupNames.map((gn) => this.dataview.groupColors[this.dataview.selectedGroups.indexOf(gn)]);
        },
        dataset(): [string, Operation[]] {
            const syllables = this.$store.getters[`${this.datasource}/selectedSyllables`];

            return [
                this.$store.getters[`datasets/resolve`]('usage'),
                [{
                    type: 'map',
                    columns: [
                        [`usage_${this.countMethod.toLowerCase()}`, 'value'],
                        ['group', 'group'],
                        [`id_${this.countMethod.toLowerCase()}`, 'syllable'],
                        ['uuid', 'id'],
                    ],
                },
                {
                    type: 'filter',
                    filters: {
                        syllable: syllables,
                        group: this.dataview.selectedGroups,
                    },
                },
                {
                    type: 'aggregate',
                    groupby: ['syllable', 'group'],
                    aggregate: {
                        value: ['mean', 'deviation', 'count']
                    },
                },
                {
                    type: 'map',
                    columns: [
                        ['group', 'group'],
                        ['syllable', 'syllable'],
                        ['value_mean', 'value'],
                        ['value_count', 'count'],
                        ['value_deviation', 'deviation'],
                    ],
                },],
            ];
        },
    },
    methods: {
        prepareData() {
            LoadData(this.dataset[0], this.dataset[1])
                .then((data: PlotData[]) => this.calculateErrors(data))
                .then((data) => this.aggregateView = data);
        },
        calculateErrors(data: PlotData[]) {
            data.forEach((item) => {
                item.sem = item.deviation / Math.sqrt(item.count);
                item.ci95 = 1.960 * item.sem;
            })
            return data;
        },
        onLineplotClick(event) {
            if (event.var) {
                this.selectedSyllable = Number.parseInt(event.var, 10);
            }
        },
        format_tooltip(itm: PlotData): string {
            return `Module: ${itm.syllable}<br />
                    Group: ${itm.group}<br />
                    Count: ${itm.count}<br />
                    Value: ${itm.value.toExponential(2)}
                        &#177; ${itm[this.errorType].toExponential(2)}<br />`;
        },
    },
});
</script>



<style scoped>

</style>