<template>
    <div>
        <HexBinPlotSVG
            :width="this.layout.width"
            :height="this.layout.height - 31"
            :data="individualUseageData"
            :useGroups="useGroups"
            :groupLabels="groupNames"
            :groupColors="groupColors"
            :resolution="settings.resolution"
            :colorscale="settings.colormap"
            :legendTitle="`Relative Occupancy`"
            :title="`Occupancy while in Module ${selectedSyllable} (${countMethod})`"
            xAxisTitle="Group"
            yAxisTitle="velocity_2d_mm"
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

import HexBinPlotCanvas from '@/components/Charts/HexBinPlot/HexBinPlotCanvas.vue';
import HexBinPlotSVG from '@/components/Charts/HexBinPlot/HexBinPlotSVG.vue';

import {WhiskerType} from '@/components/Charts/BoxPlot/BoxPlot.types';

import { CountMethod } from '@/store/dataview.types';
import path from 'path';
import fs from 'fs';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import { PositionPlotMode } from './PositionPlotOptions.vue';





RegisterDataComponent({
    friendly_name: 'Position Plot',
    component_type: 'PositionPlot',
    settings_type: 'PositionPlotOptions',
    init_width: 400,
    init_height: 380,
    default_settings: {
        mode: PositionPlotMode.Overall,
        resolution: 2,
        colormap: 'interpolateBuPu',
    },
});

export default mixins(LoadingMixin, WindowMixin).extend({
    components: {
        HexBinPlotCanvas,
        HexBinPlotSVG,
    },
    data() {
        return {
            individualUseageData: null,
        };
    },
    computed: {
        selectedSyllable(): number {
            return this.dataview.selectedSyllable;
        },
        countMethod(): string {
            return this.dataview.countMethod;
        },
        useGroups(): boolean {
            return this.settings.mode === PositionPlotMode.Grouped;
        },
        groupNames(): string[] {
            return this.dataview.selectedGroups;
        },
        groupColors(): string[] {
            return this.dataview.groupColors;
        },
        dataspec(): string[] {
            const rID = this.$store.getters[`${this.datasource}/selectedSyllableAs`](CountMethod.Raw);
            return [
                this.$store.getters[`datasets/resolve`](`scalars/${rID}`),
                [
                    {
                        type: 'map',
                        columns: [
                            ['uuid', 'id'],
                            ['centroid_x_mm', 'x'],
                            ['centroid_y_mm', 'y'],
                            'group',
                        ],
                    },
                ],
            ];
        },
    },
    watch: {
        dataspec: {
            handler(newValue) {
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



<style scoped>
.no-data .card {
    width: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>