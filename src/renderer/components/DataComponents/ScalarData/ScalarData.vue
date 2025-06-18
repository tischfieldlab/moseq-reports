<template>
    <component :is="render_mode"
        :width="layout.width"
        :height="layout.height"
        :data="individualUseageData"
        :groupLabels="dataview.selectedGroups"
        :groupColors="dataview.selectedGroupColors"
        :show_boxplot="settings.show_boxplot"
        :whisker_type="settings.boxplot_whiskers"
        :show_points="settings.show_points"
        :point_size="settings.point_size"
        :show_violinplot="settings.show_violinplot"
        :kde_scale="settings.kde_scale"
        :tooltipFormatter="tooltip_formatter"
        xAxisTitle="Group"
        :yAxisTitle="`Syllable #${dataview.selectedSyllable} (${dataview.countMethod}) ${metricTitle} (${metricUnits})`"
        :noDataMessage="`Sorry, there is no scalar data available for Syllable ${dataview.selectedSyllable} (${dataview.countMethod})`"
    />
</template>
<script lang="ts">
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
</script>
<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import RegisterDataComponent from '@render/components/Core';
import {BoxPlotSVG, BoxPlotCanvas, WhiskerType, DataPoint, GroupStats} from '@render/components/Charts/BoxPlot';
import { CountMethod } from '@store/dataview.types';
import { RenderMode } from '@store/datawindow.types';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import { ScalarDataSettings, availableMetrics as _availableMetrics } from './ScalarData.types';
import DataService, {Operation} from '@render/api';

const props = defineProps<{
    id: string;
}>();


const {$wstate, layout, dataview, settings} = useWindowMixin<ScalarDataSettings>(props.id);


const availableMetrics = ref(_availableMetrics);
const individualUseageData = ref<DataPoint[]>([]);



const render_mode = computed(() => {
    if ($wstate.render_mode === RenderMode.CANVAS) {
        return BoxPlotCanvas;
    } else if ($wstate.render_mode === RenderMode.SVG) {
        return BoxPlotSVG;
    } else {
        // tslint:disable-next-line:no-console
        console.error('invalid render mode', $wstate.render_mode);
        return BoxPlotCanvas;
    }
});
// returns current metric if changed
const currentMetric = computed((): string => {
    return $wstate.settings.metric;
});
// returns current unit of measurement if change occurs to currentMetric.
const metricUnits = computed((): string => {
    return availableMetrics.value[currentMetric.value].units;
});
const metricTitle = computed((): string => {
    return availableMetrics.value[currentMetric.value].title;
});

const dataspec = computed((): Operation[] => {
    return [
        {
            type: 'map',
            columns: [
                ['uuid', 'id'],
                [currentMetric.value, 'value'],
                'group',
            ],
        }, {
            type: 'filter',
            filters: {
                group: dataview.value.selectedGroups,
            },
        }, {
            type: 'aggregate',
            groupby: ['id', 'group'],
            aggregate: {
                value: 'mean'
            }
        },
    ];
});

watchEffect(() => {
    const rID = dataview.value.selectedSyllableAs(CountMethod.Raw);
    DataService.fetchData<any>(`scalars/${rID}`, dataspec.value)
        .then((data) => individualUseageData.value = data)
        .catch((err) => {
            individualUseageData.value = [];
        });
});


function tooltip_formatter(value: DataPoint|GroupStats) {
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
}
</script>