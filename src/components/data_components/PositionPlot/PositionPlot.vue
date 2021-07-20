<template>
    <component :is="render_mode"
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
import RegisterDataComponent from '@/components/Core';
import LoadingMixin from '@/components/Core/LoadingMixin';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';
import HexBinPlotCanvas from '@/components/Charts/HexBinPlot/HexBinPlotCanvas.vue';
import HexBinPlotSVG from '@/components/Charts/HexBinPlot/HexBinPlotSVG.vue';
import { CountMethod } from '@/store/dataview.types';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import { PositionPlotMode } from './PositionPlotOptions.vue';
import { RenderMode } from '@/store/datawindow.types';





RegisterDataComponent({
    friendly_name: 'Position Plot',
    component_type: 'PositionPlot',
    settings_type: 'PositionPlotOptions',
    init_width: 400,
    init_height: 380,
    available_render_modes: [RenderMode.SVG, RenderMode.CANVAS],
    default_render_mode: RenderMode.SVG,
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
        render_mode(): string {
            if (this.$wstate.render_mode === RenderMode.CANVAS) {
                return 'HexBinPlotCanvas';
            } else if (this.$wstate.render_mode === RenderMode.SVG) {
                return 'HexBinPlotSVG';
            } else {
                // tslint:disable-next-line:no-console
                console.error('invalid render mode', this.$wstate.render_mode);
                return 'HexBinPlotSVG';
            }
        },
        selectedSyllable(): number {
            return this.dataview.selectedSyllable;
        },
        countMethod(): string {
            return this.dataview.countMethod;
        },
        useGroups(): boolean {
            return this.settings.mode === PositionPlotMode.Grouped;
        },
        groupNames(): Array<string> {
            return this.dataview.selectedGroups;
        },
        groupColors(): Array<string> {
            return this.dataview.groupColors;
        },
        dataspec(): Array<string> {
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