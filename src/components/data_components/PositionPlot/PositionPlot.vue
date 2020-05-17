<template>
    <div>
        <HexBinPlot
            :width="this.layout.width"
            :height="this.layout.height - 31"
            :data="individualUseageData"
            :groupLabels="groupNames"
            :groupColors="groupColors"
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

import HexBinPlot from '@/components/Charts/HexBinPlot/HexBinPlot.vue';
import {WhiskerType} from '@/components/Charts/BoxPlot/BoxPlot.types';

import { CountMethod } from '@/store/dataview.types';
import path from 'path';
import fs from 'fs';
import DataFrame from 'dataframe-js';
import {LoadData} from '@/components/Core/DataLoader/DataLoader';





RegisterDataComponent({
    friendly_name: 'Position Plot',
    component_type: 'PositionPlot',
    settings_type: 'PositionPlotOptions',
    init_width: 400,
    init_height: 380,
    default_settings: {
        show_points: false,
        point_size: 2,
        show_boxplot: true,
        show_violinplot: false,
        boxplot_whiskers: WhiskerType.TUKEY,
    },
});

export default mixins(LoadingMixin, WindowMixin).extend({
    components: {
        HexBinPlot,
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
            return [path.join(pth, 'scalars', `${base}.json`), base];
        },
    },
    watch: {
        data_path: {
            async handler(newValue) {
                this.individualUseageData = await LoadData(newValue[0], [
                    ['uuid', 'id'],
                    ['centroid_x_mm', 'x'],
                    ['centroid_y_mm', 'y'],
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