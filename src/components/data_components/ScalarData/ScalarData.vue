<template>
    <box-plot
        :width="this.layout.width"
        :height="this.layout.height - 32"
        :data="individualUseageData"
        :groupLabels="groupNames"
        :groupColors="groupColors"
        :whisker_type="settings.boxplot_whiskers"
        :show_boxplot="settings.show_boxplot"
        :show_points="settings.show_points"
        :show_violinplot="settings.show_violinplot"
        :point_size="settings.point_size"
        xAxisTitle="Group"
        :yAxisTitle="`${metricTitle} (${metricUnits})`"
        :noDataMessage="`Sorry, there is no scalar data available for Syllable ${selectedSyllable} (${countMethod})`"
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

import { CountMethod } from '@/store/dataview.types';
import path from 'path';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import { Operation } from '../../Core/DataLoader/DataLoader.types';



RegisterDataComponent({
    friendly_name: 'Scalar Data',
    component_type: 'ScalarData',
    settings_type: 'ScalarDataOptions',
    init_width: 400,
    init_height: 500,
    default_settings: {
        metric: 'velocity_2d_mm',
        show_points: false,
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
    data() {
        return {
            individualUseageData: null,
            availableMetrics: {
                angle: {
                    title: 'Angle',
                    units: 'degrees',
                },
                velocity_2d_mm: {
                    title: 'Velocity 2D',
                    units: 'mm/s',
                },
                velocity_3d_mm: {
                    title: 'Velocity 3D',
                    units: 'mm/s',
                },
                velocity_theta: {
                    title: 'Velocity Theta',
                    units: 'degrees',
                },
                width_mm: {
                    title: 'Width',
                    units: 'mm',
                },
                height_ave_mm: {
                    title: 'Height',
                    units: 'mm',
                },
                length_mm: {
                    title: 'Length',
                    units: 'mm',
                },
                area_mm: {
                    title: 'Area',
                    units: 'mm^2',
                },
            },
        };
    },
    computed: {
        currentMetric(): string {
            return this.settings.metric;
        },
        metricUnits(): string {
            return this.availableMetrics[this.currentMetric].units;
        },
        metricTitle(): string {
            return this.availableMetrics[this.currentMetric].title;
        },
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
        dataspec(): [string, Operation[]] {
            const rID = this.$store.getters[`${this.datasource}/selectedSyllableAs`](CountMethod.Raw);
            return [
                this.$store.getters[`datasets/resolve`](`scalars/${rID}`),
                [
                    {
                        type: 'map',
                        columns: [
                            ['uuid', 'id'],
                            [this.currentMetric, 'value'],
                            'group',
                        ],
                    },
                ],
            ];
        },
    },
    watch: {
        dataspec: {
            async handler(newValue) {
                this.$emit('start-loading');
                LoadData(newValue[0], newValue[1])
                .then((data) => this.individualUseageData = data)
                .then(() => this.$emit('finish-loading'));
            },
            immediate: true,
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
