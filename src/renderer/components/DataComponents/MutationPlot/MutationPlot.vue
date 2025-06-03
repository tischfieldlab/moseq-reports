<template>
    <component :is="render_mode"
        :width="layout.width"
        :height="layout.height"
        :data="aggregateView"
        varKey="syllable"
        valueKey="value"
        seriesKey="group"
        :errorKey="$wstate.settings.error_type"
        :showError="$wstate.settings.show_errors"
        :varOrdering="syllable_ordering"
        :seriesLabels="groupNames"
        :seriesColors="groupColors"
        :showPoints="$wstate.settings.show_points"
        :pointSize="$wstate.settings.point_size"
        :showLines="$wstate.settings.show_lines"
        :lineWeight="$wstate.settings.line_weight"
        xAxisTitle="Module ID"
        :yAxisTitle="`Module Usage (${dataview.countMethod})`"
        :tooltipFormatter="format_tooltip"
        @lineplot-click="onLineplotClick"
    />
</template>
<script lang="ts">
RegisterDataComponent({
    friendly_name: 'Mutation Plot',
    component_type: 'MutationPlot',
    settings_type: 'MutationPlotOptions',
    init_width: 950,
    init_height: 250,
    available_render_modes: [RenderMode.SVG, RenderMode.CANVAS],
    default_render_mode: RenderMode.SVG,
    default_settings: {
        show_points: true,
        point_size: 4,
        show_lines: true,
        line_weight: 3,
        show_errors: true,
        error_type: 'sem',
        group_order_type: OrderingType.Natural,
        syllable_order_type: OrderingType.Natural,
        syllable_order_group_value: undefined,
        syllable_order_direction: SortOrderDirection.Dec,
        syllable_order_dataset: undefined,
        syllable_order_diff_minuend: undefined,
        syllable_order_diff_subtrahend: undefined,
    },
});
</script>
<script setup lang="ts">
import RegisterDataComponent from '@render/components/Core';
import { LinePlotSVG, LinePlotCanvas} from '@render/components/Charts/LinePlot';
import {OrderingType} from '@render/components/Charts/ClusteredHeatmap';
import DataService, { Operation } from '@api';
import { RenderMode } from '@store/datawindow.types';
import { shallowRef, computed, watchEffect } from 'vue';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import { MutationPlotSettings, PlotData } from './MutationPlot.types';
import { SortOrderDirection } from '@render/components/Charts/common.types';




const props = defineProps<{
    id: string;
}>();

const {$wstate, dataview, layout, settings} = useWindowMixin<MutationPlotSettings>(props.id);


const aggregateView = shallowRef<PlotData[]>([]);



const render_mode = computed(() => {
    if ($wstate.render_mode === RenderMode.CANVAS) {
        return LinePlotCanvas;
    } else if ($wstate.render_mode === RenderMode.SVG) {
        return LinePlotSVG;
    } else {
        // tslint:disable-next-line:no-console
        console.error('invalid render mode', $wstate.render_mode);
        return LinePlotSVG;
    }
});
const syllable_ordering = computed((): any[] => {
    if ($wstate.settings.syllable_order_type === OrderingType.Natural) {
        return dataview.selectedSyllables;

    } else if ($wstate.settings.syllable_order_type === OrderingType.Dataset) {
        if (dataview.views[$wstate.settings.syllable_order_dataset] !== undefined) {
            return dataview.views[$wstate.settings.syllable_order_dataset].data.map((d) => Number.parseInt(d, 10));
        }

    } else if ($wstate.settings.syllable_order_type === OrderingType.Value) {
        return aggregateView.value
                    .filter((u) => u.group === $wstate.settings.syllable_order_group_value)
                    .sort((a, b) => {
                        if ($wstate.settings.syllable_order_direction === SortOrderDirection.Dec) {
                            return b.value - a.value;
                        } else {
                            return a.value - b.value;
                        }
                    })
                    .map((u) => u.syllable);
    } else if ($wstate.settings.syllable_order_type === OrderingType.Computed) {
        const syllables = dataview.selectedSyllables;
        const minData = aggregateView.value.filter((u) => u.group === $wstate.settings.syllable_order_diff_minuend);
        const subData = aggregateView.value.filter((u) => u.group === $wstate.settings.syllable_order_diff_subtrahend);

        return syllables.map((s) => {
            const min = minData.find((p) => p.syllable === s)?.value || 0;
            const sub = subData.find((p) => p.syllable === s)?.value || 0;
            return {
                syllable: s,
                value: min - sub,
            };
        }).sort((a, b) => {
            if ($wstate.settings.syllable_order_direction === SortOrderDirection.Dec) {
                return b.value - a.value;
            } else {
                return a.value - b.value;
            }
        })
        .map((u) => u.syllable);
    }else {
        // tslint:disable-next-line:no-console
        console.warn(`Unsupported group order type ${$wstate.settings.syllable_order_type}`);
    }
    return [];
});
const groupNames = computed((): string[] => {
    if ($wstate.settings.group_order_type === OrderingType.Natural) {
        return dataview.selectedGroups;
    /*} else if ($wstate.settings.group_order_type === OrderingType.Dataset) {
        if (dataview.views[$wstate.settings.group_order_dataset] !== undefined) {
            return dataview.views[$wstate.settings.group_order_dataset].data
        }
    */} else {
        // tslint:disable-next-line:no-console
        console.warn(`Unsupported group order type ${$wstate.settings.group_order_type}`);
    }
    return [];
});
const groupColors = computed((): string[] => {
    return groupNames.value.map((gn) => dataview.selectedGroupColors[dataview.selectedGroups.indexOf(gn)]);
});
const dataset = computed((): Operation[] => {
    return [
        {
            type: 'map',
            columns: [
                [`usage_${dataview.countMethod.toLowerCase()}`, 'value'],
                ['group', 'group'],
                [`id_${dataview.countMethod.toLowerCase()}`, 'syllable'],
                ['uuid', 'id'],
            ],
        },
        {
            type: 'filter',
            filters: {
                syllable: dataview.selectedSyllables,
                group: dataview.selectedGroups,
            },
        },
        {
            type: 'aggregate',
            groupby: ['syllable', 'group'],
            aggregate: {
                value: ['mean', 'deviation', 'count']
            },
        },
        {
            type: 'map',
            columns: [
                ['group', 'group'],
                ['syllable', 'syllable'],
                ['value_mean', 'value'],
                ['value_count', 'count'],
                ['value_deviation', 'deviation'],
            ],
        },
    ];
});

watchEffect(async () => {
    await DataService.fetchData<PlotData[]>('usage', dataset.value)
        .then((data) => aggregateView.value = calculateErrors(data));
});

function calculateErrors(data: PlotData[]) {
    data.forEach((item) => {
        item.sem = item.deviation / Math.sqrt(item.count);
        item.ci95 = 1.960 * item.sem;
    })
    return data;
}
function onLineplotClick(event) {
    if (event.var) {
        dataview.selectedSyllable = Number.parseInt(event.var, 10);
    }
}
function format_tooltip(itm: PlotData): string {
    return `Module: ${itm.syllable}<br />
            Group: ${itm.group}<br />
            Count: ${itm.count}<br />
            Value: ${itm.value.toExponential(2)}
                &#177; ${itm[$wstate.settings.error_type].toExponential(2)}<br />`;
}

</script>



<style scoped>

</style>