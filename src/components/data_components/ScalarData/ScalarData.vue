<template>
    <component :is="render_mode"
        :width="this.layout.width"
        :height="this.layout.height - 32"
        :data="individualUseageData"
        :groupLabels="groupNames"
        :groupColors="groupColors"
        :show_boxplot="settings.show_boxplot"
        :whisker_type="settings.boxplot_whiskers"
        :show_points="settings.show_points"
        :point_size="settings.point_size"
        :show_violinplot="settings.show_violinplot"
        :kde_scale="settings.kde_scale"
        :tooltipFormatter="tooltip_formatter"
        xAxisTitle="Group"
        :yAxisTitle="`Module #${selectedSyllable} (${countMethod}) ${metricTitle} (${metricUnits})`"
        :noDataMessage="`Sorry, there is no scalar data available for Syllable ${selectedSyllable} (${countMethod})`"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/Core';
import LoadingMixin from '@/components/Core/LoadingMixin';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/Window/WindowMixin';

import {BoxPlotSVG, BoxPlotCanvas, WhiskerType, DataPoint, GroupStats} from '@/components/Charts/BoxPlot';


import { CountMethod } from '@/store/dataview.types';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import { Operation } from '../../Core/DataLoader/DataLoader.types';
import { RenderMode } from '@/store/datawindow.types';



RegisterDataComponent({
    friendly_name: 'Scalar Data',
    component_type: 'ScalarData',
    settings_type: 'ScalarDataOptions',
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.CANVAS, RenderMode.SVG],
    default_render_mode: RenderMode.CANVAS,
    default_settings: {
        metric: 'velocity_2d_mm',
        show_points: true,
        point_size: 2,
        show_boxplot: true,
        boxplot_whiskers: WhiskerType.TUKEY,
        show_violinplot: false,
        kde_scale: 0.25,
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
                [{
                    type: 'map',
                    columns: [
                        ['uuid', 'id'],
                        [this.currentMetric, 'value'],
                        'group',
                    ],
                }, {
                    type: 'filter',
                    filters: {
                        group: this.dataview.selectedGroups,
                    },
                }, {
                    type: 'aggregate',
                    groupby: ['id', 'group'],
                    aggregate: {
                        value: 'mean'
                    }
                }],
            ];
        },
    },
    watch: {
        dataspec: {
            async handler(newValue) {
                this.emitStartLoading();
                LoadData(newValue[0], newValue[1])
                .then((data) => this.individualUseageData = data)
                .then(() => this.emitFinishLoading());
            },
            immediate: true,
        },
    },
    methods: {
        tooltip_formatter(value: DataPoint|GroupStats, sender: Vue) {
            if (value !== undefined){
                if (value.hasOwnProperty('id')) {
                    const itm = value as DataPoint;
                    return `ID: ${itm.id.split('-').pop()}<br />
                            Value: ${itm.value.toExponential(3)}`;
                } else if(value.hasOwnProperty('count')) {
                    const itm = value as GroupStats;
                    return `Group: ${itm.group}<br />
                            Count: ${itm.count.toString()}<br />
                            Median: ${itm.q2.toExponential(3)}<br />`;
                } else {
                    return JSON.stringify(value, undefined, '\t');
                }
            }
            return '';
        },
    },
});
</script>
