<template>
    <b-container fluid>
        <b-row>
            <b-col>
                <b-input-group prepend="Metric">
                    <b-form-select v-model="metric" :options="metric_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Point Size">
                    <b-form-input type="number" v-model.number="point_size" :disabled="!show_points" min="1" max="10" ></b-form-input>
                    <b-input-group-text>
                        <b-form-checkbox v-model="show_points" switch />
                    </b-input-group-text>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Boxplot Whiskers">
                    <b-form-select v-model="boxplot_whiskers" :options="whisker_options" :disabled="!show_boxplot"></b-form-select>
                    <b-input-group-text>
                        <b-form-checkbox v-model="show_boxplot" switch />
                    </b-input-group-text>
                </b-input-group>
                <div v-show="show_boxplot" class="figure-caption">{{ boxplot_whisker_description }}</div>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Violin KDE Scale">
                    <b-form-input type="number" v-model.number="kde_scale" :disabled="!show_violinplot" min="0.0" step="0.001" max="1" debounce="300" ></b-form-input>
                    <b-input-group-text>
                        <b-form-checkbox v-model="show_violinplot" switch />
                    </b-input-group-text>
                </b-input-group>
            </b-col>
        </b-row>
    </b-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { WhiskerType } from '@render/components/Charts/BoxPlot';
import { availableMetrics, ScalarDataSettings } from './ScalarData.types';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';


const props = defineProps<{
    id: string;
}>();


const {$wstate} = useWindowMixin<ScalarDataSettings>(props.id);


const whisker_options = ref([
    {
        value: WhiskerType.TUKEY,
        text: 'Tukey',
        description: 'Whiskers extend up to 1.5 * IQR from 25th and 75th percentile',
    }, {
        value: WhiskerType.MIN_MAX,
        text: 'Min/Max',
        description: 'Whiskers extend to min and max data points',
    },
]);
const metric_options = ref(Object.entries(availableMetrics).map(([metric, info]) => ({value: metric, text: info.title})));

// returns current metric. If changed, value is updated through the `updateComponentSettings` in the store.
const metric = computed({
    get(): string {
        return $wstate.settings.metric;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                metric: value,
            },
        });
    },
});
const show_points = computed({
    get(): boolean {
        return $wstate.settings.show_points;
    },
    set(value: boolean) {
        $wstate.updateComponentSettings({
            settings: {
                show_points: value,
            },
        });
    },
});
// returns size of data points. If changed, value is updated through the `updateComponentSettings` mutation in the store.
const point_size = computed({
    get(): number {
        return $wstate.settings.point_size;
    },
    set(value: number) {
        $wstate.updateComponentSettings({
            settings: {
                point_size: value,
            },
        });
    },
});
// boolean that determines whether boxplot will be shown. If changed, the value is updated through `updateComponentSettings` in the store.
const show_boxplot = computed({
    get(): boolean {
        return $wstate.settings.show_boxplot;
    },
    set(value: boolean) {
        $wstate.updateComponentSettings({
            settings: {
                show_boxplot: value,
            },
        });
    },
});
// Whisker data that determines the type of whisker the Boxplot has.
const boxplot_whiskers = computed({
    get(): WhiskerType {
        return $wstate.settings.boxplot_whiskers;
    },
    set(value: WhiskerType) {
        $wstate.updateComponentSettings({
            settings: {
                boxplot_whiskers: value,
            },
        });
    },
});
const boxplot_whisker_description = computed((): string => {
    return whisker_options.value.find((wo) => wo.value === boxplot_whiskers.value)!.description;
});
// boolean that determines whether illusion will be played. If changed, value is updated through the `updateComponentSettings` in the store.
const show_violinplot = computed({
    get(): boolean {
        return $wstate.settings.show_violinplot;
    },
    set(value: boolean) {
        $wstate.updateComponentSettings({
            settings: {
                show_violinplot: value,
            },
        });
    },
});
const kde_scale = computed({
    get(): number {
        return $wstate.settings.kde_scale;
    },
    set(value: number) {
        $wstate.updateComponentSettings({
            settings: {
                kde_scale: value,
            },
        });
    },
});
</script>

<style lang="scss" scoped>
.row {
    margin:10px 0;
}
</style>