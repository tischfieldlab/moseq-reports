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
            return this.dataview.selectedGroups;
        },
        groupColors(): string[] {
            return this.dataview.groupColors;
        },
        dataset(): string {
            if (this.countMethod === CountMethod.Usage) {
                return this.$store.getters[`datasets/resolve`]('usage_usage');
            } else if (this.countMethod === CountMethod.Frames) {
                return this.$store.getters[`datasets/resolve`]('usage_frames');
            } else {
                throw new Error(`Count method ${this.countMethod} is not supported`);
            }
        },
    },
    asyncComputed: {
        individualUseageData(): any {
            return LoadData(this.dataset, [
                {
                    type: 'map',
                    columns: [
                        ['usage', 'value'],
                        ['group', 'group'],
                        ['StartTime', 'id'],
                        ['syllable', 'syllable'],
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
        /*point_tooltip(item: UsageItem): string {
            return `<div style="text-align:left;">
                        ${item.group}<br />
                        ${new Date(item.StartTime).toLocaleString('en-US')}<br />
                        ${item.usage.toExponential(3)}
                    </div>`;
        },*/
    },
});
</script>



<style scoped>

</style>