<template>
    <component :is="render_mode"
        :width="this.layout.width"
        :height="this.layout.height"
        :data="individualUseageData"
        :groupLabels="groupNames"
        :groupColors="groupColors"
        
        :show_boxplot="settings.show_boxplot"
        :whisker_type="settings.boxplot_whiskers"

        :show_points="settings.show_points"
        :point_size="settings.point_size"

        :show_violinplot="settings.show_violinplot"
        :kde_scale="settings.violin_kde_scale"
        
        xAxisTitle="Group"
        :yAxisTitle="`Module #${selectedSyllable} Usage (${countMethod})`"
        :tooltipFormatter="format_tooltip"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/Core';
import LoadingMixin from '@/components/Core/LoadingMixin';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/Window/WindowMixin';

import {BoxPlotSVG, BoxPlotCanvas, WhiskerType} from '@/components/Charts/BoxPlot';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import {OrderingType} from '@/components/Charts/ClusteredHeatmap';
import { Operation } from '../../Core/DataLoader/DataLoader.types';
import { RenderMode } from '@/store/datawindow.types';


RegisterDataComponent({
    friendly_name: 'Usage Details',
    component_type: 'DetailedUsage',
    settings_type: 'DetailedUsageOptions',
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.CANVAS, RenderMode.SVG],
    default_render_mode: RenderMode.SVG,
    default_settings: {
        show_points: true,
        point_size: 2,
        show_boxplot: true,
        show_violinplot: false,
        violin_kde_scale: 0.01,
        boxplot_whiskers: WhiskerType.TUKEY,
        group_order_type: OrderingType.Natural,
    },
});

export default mixins(LoadingMixin, WindowMixin).extend({
    components: {
        BoxPlotCanvas,
        BoxPlotSVG,
    },
    data() {
        return {
            individualUseageData: [],
        };
    },
    watch: {
        dataset: {
            handler(): any {
                LoadData(this.dataset[0], this.dataset[1])
                .then((data) => this.individualUseageData = data);
            },
            immediate: true,
        },
    },
    computed: {
        render_mode(): string {
            if (this.$wstate.render_mode === RenderMode.CANVAS) {
                return 'BoxPlotCanvas';
            } else if (this.$wstate.render_mode === RenderMode.SVG) {
                return 'BoxPlotSVG';
            } else {
                // tslint:disable-next-line:no-console
                console.error('invalid render mode', this.$wstate.render_mode);
                return 'BoxPlotCanvas';
            }
        },
        selectedSyllable(): number {
            return this.dataview.selectedSyllable;
        },
        countMethod(): string {
            return this.dataview.countMethod;
        },
        groupNames(): string[] {
            if (this.settings.group_order_type === OrderingType.Natural) {
                return this.dataview.selectedGroups;
            } else if (this.settings.group_order_type === OrderingType.Dataset) {
                if (this.dataview.views[this.settings.group_order_dataset] !== undefined) {
                    return this.dataview.views[this.settings.group_order_dataset].data;
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
                        syllable: [this.selectedSyllable],
                        group: this.dataview.selectedGroups,
                    },
                },
                {
                    type: 'sort',
                    columns: [['value', 'asc']],
                }],
            ];
        },
    },
    methods: {
        format_tooltip(itm: any): string {
            if (itm.hasOwnProperty('id')) {
                return `ID: ${itm.id.split('-').pop()}<br />
                        Usage: ${itm.value.toExponential(3)}`;
            } else if(itm.hasOwnProperty('count')) {
                return `Group: ${itm.group}<br />
                        Count: ${itm.count.toString()}<br />
                        Median: ${itm.q2.toExponential(3)}<br />`;
            } else {
                return JSON.stringify(itm, undefined, '\t');
            }
        },
    },
});
</script>



<style scoped>

</style>