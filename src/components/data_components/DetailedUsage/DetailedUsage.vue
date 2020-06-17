<template>
    <box-plot
        :width="this.layout.width"
        :height="this.layout.height - 31"
        :data="individualUseageData"
        :groupLabels="groupNames"
        :groupColors="groupColors"
        :whisker_type="settings.boxplot_whiskers"
        :show_boxplot="settings.show_boxplot"
        :show_points="settings.show_points"
        :show_violinplot="settings.show_violinplot"
        :point_size="settings.point_size"
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
import WindowMixin from '@/components/Core/WindowMixin';

import BoxPlot from '@/components/Charts/BoxPlot/BoxPlotCanvas.vue';
import {WhiskerType} from '@/components/Charts/BoxPlot/BoxPlot.types';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import { CountMethod } from '../../../store/dataview.types';
import {OrderingType} from '@/components/Charts/ClusteredHeatmap/ClusterHeatmap.types';


RegisterDataComponent({
    friendly_name: 'Usage Details',
    component_type: 'DetailedUsage',
    settings_type: 'DetailedUsageOptions',
    init_width: 400,
    init_height: 500,
    default_settings: {
        show_points: true,
        point_size: 2,
        show_boxplot: true,
        show_violinplot: false,
        boxplot_whiskers: WhiskerType.TUKEY,
        group_order_type: OrderingType.Natural,
    },
});

export default mixins(LoadingMixin, WindowMixin).extend({
    components: {
        BoxPlot,
    },
    computed: {
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
            return this.dataview.groupColors;
        },
        dataset(): string {
            return this.$store.getters[`datasets/resolve`]('usage');
        },
    },
    asyncComputed: {
        individualUseageData(): any {
            return LoadData(this.dataset, [
                {
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
                    column: 'value',
                    direction: 'asc',
                },
            ]);
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