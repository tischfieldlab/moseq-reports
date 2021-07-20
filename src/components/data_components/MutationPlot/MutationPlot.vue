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
import LoadingMixin from '@/components/Core/LoadingMixin';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';

import BoxPlot from '@/components/Charts/BoxPlot/BoxPlotCanvas.vue';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import {OrderingType} from '@/components/Charts/ClusteredHeatmap/ClusterHeatmap.types';
import { Operation } from '../../Core/DataLoader/DataLoader.types';


/*
RegisterDataComponent({
    friendly_name: 'Mutation Plot',
    component_type: 'MutationPlot',
    settings_type: 'MutationPlotOptions',
    init_width: 400,
    init_height: 500,
    available_render_modes: [RenderMode.CANVAS],
    default_render_mode: RenderMode.CANVAS,
    default_settings: {
        show_points: true,
        point_size: 2,
        show_boxplot: true,
        show_violinplot: false,
        boxplot_whiskers: WhiskerType.TUKEY,
        group_order_type: OrderingType.Natural,
    },
});
*/

export default mixins(LoadingMixin, WindowMixin).extend({
    components: {
        BoxPlot,
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
        selectedSyllable(): number {
            return this.dataview.selectedSyllable;
        },
        countMethod(): string {
            return this.dataview.countMethod;
        },
        groupNames(): Array<string> {
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
        groupColors(): Array<string> {
            return this.dataview.groupColors;
        },
        dataset(): [string, Array<Operation>] {
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
                    columns: ['value'],
                    direction: 'asc',
                }],
            ];
        },
    },
    methods: {
        format_tooltip(itm: any): string {
            if (itm.hasOwnProperty('id')) {
                return `ID: ${itm.id.split('-').pop()}<br />
                        Usage: ${itm.value.toExponential(3)}`;
            } else if (itm.hasOwnProperty('count')) {
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