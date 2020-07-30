<template>
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
        resolution: 5,
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
            individualUseageData: [],
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
                this.emitStartLoading();
                LoadData(newValue[0], newValue[1])
                    .then((data) => this.individualUseageData = data)
                    .then(() => this.emitFinishLoading());
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

</style>