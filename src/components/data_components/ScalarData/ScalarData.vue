<template>
    <div>
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
        />
        <div v-show="individualUseageData === null" class="no-data">
            <b-card bg-variant="primary" text-variant="white" class="text-center">
                <b-card-text>
                    Sorry, there is no scalar data available for Syllable {{selectedSyllable}} ({{countMethod}}) 
                </b-card-text>
            </b-card>
        </div>
    </div>
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
        data_path(): string[] {
            const rID = this.$store.getters[`${this.datasource}/selectedSyllableAs`](CountMethod.Raw);
            const pth = this.$store.state.datasets.path;
            const base = `usage_scalars_${rID}`;
            return [path.join(pth, 'scalars', `${base}.json`), base, this.currentMetric];
        },
    },
    watch: {
        data_path: {
            async handler(newValue) {
                this.individualUseageData = await LoadData(newValue[0], [
                    ['uuid', 'id'],
                    [this.currentMetric, 'value'],
                    'group',
                ]);
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



<style scoped>
.no-data .card {
    width: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>