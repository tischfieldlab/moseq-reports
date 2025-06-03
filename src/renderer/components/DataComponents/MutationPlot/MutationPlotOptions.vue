<template>
    <BContainer fluid>
        <!--<BRow>
            <BCol>
                <BInputGroup prepend="Group Ordering">
                    <BFormSelect v-model="group_order_type" :options="group_order_options"></BFormSelect>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="group_order_type === 'dataset'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Dataset">
                    <DatasetPicker v-model="group_order_dataset" :dataview="dataview" :owner="id" />
                </BInputGroup>
            </BCol>
        </BRow>-->
        <BRow>
            <BCol>
                <BInputGroup prepend="Module Ordering">
                    <BFormSelect v-model="syllable_order_type" :options="syllable_order_options"></BFormSelect>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="syllable_order_type === 'value'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Sort by">
                    <BFormSelect v-model="syllable_order_group_value" :options="group_options"></BFormSelect>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="syllable_order_type === 'value'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Direction">
                    <BFormSelect v-model="syllable_order_direction" :options="order_direction_options"></BFormSelect>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="syllable_order_type === 'computed'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Minuend Group">
                    <BFormSelect v-model="syllable_order_diff_minuend" :options="group_options"></BFormSelect>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="syllable_order_type === 'computed'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Subtrahend Group">
                    <BFormSelect v-model="syllable_order_diff_subtrahend" :options="group_options"></BFormSelect>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="syllable_order_type === 'dataset'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Dataset">
                    <DatasetPicker v-model="syllable_order_dataset" :dataview="datasource" :owner="id" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <BInputGroup prepend="Point Size">
                    <BFormInput type="number" v-model="point_size" :disabled="!show_points" min="1" max="10" ></BFormInput>
                    <BInputGroupText>
                        <BFormCheckbox v-model="show_points" switch />
                    </BInputGroupText>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <BInputGroup prepend="Line Weight">
                    <BFormInput type="number" v-model="line_weight" :disabled="!show_lines" min="1" max="10" ></BFormInput>
                    <BInputGroupText>
                        <BFormCheckbox v-model="show_lines" switch />
                    </BInputGroupText>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <BInputGroup prepend="Error Bars">
                    <!-- not used yet -->
                    <BFormSelect v-model="error_type" :options="error_type_options" :disabled="!show_errors"></BFormSelect>
                    <BInputGroupText>
                        <BFormCheckbox v-model="show_errors" switch />
                    </BInputGroupText>
                </BInputGroup>
            </BCol>
        </BRow>
    </BContainer>
</template>

<script setup lang="ts">
import {OrderingType} from '@render/components/Charts/ClusteredHeatmap';
import DatasetPicker from '@render/components/DatasetPicker.vue';
import { onMounted, ref, computed } from 'vue';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import { MutationPlotSettings } from './MutationPlot.types';
import { SortOrderDirection } from '@render/components/Charts/common.types';


const props = defineProps<{
    id: string;
}>();

const {$wstate, dataview, datasource} = useWindowMixin<MutationPlotSettings>(props.id);

onMounted(() => {
    if ($wstate.settings.syllable_order_group_value === undefined) {
        $wstate.settings.syllable_order_group_value = group_options.value[0].value;
    }
    if ($wstate.settings.syllable_order_diff_minuend === undefined) {
        $wstate.settings.syllable_order_diff_minuend = group_options.value[0].value;
    }
    if ($wstate.settings.syllable_order_diff_subtrahend === undefined) {
        $wstate.settings.syllable_order_diff_subtrahend = group_options.value[0].value;
    }
});

const group_order_options = ref([
    { text: 'Filter Order', value: OrderingType.Natural },
    { text: 'Dataset', value: OrderingType.Dataset },
]);
const syllable_order_options = ref([
    { text: 'ID', value: OrderingType.Natural },
    { text: 'Value', value: OrderingType.Value },
    { text: 'Value Difference', value: OrderingType.Computed },
    { text: 'Dataset', value: OrderingType.Dataset },
]);
const order_direction_options = ref([
    { text: 'Ascending', value: SortOrderDirection.Asc },
    { text: 'Descending', value: SortOrderDirection.Dec },
]);
const error_type_options = ref([
    { text: 'SEM', value: 'sem' },
    { text: '95% CI', value: 'ci95' },
]);


const group_options = computed((): {text: string, value: string}[] => {
    return dataview.value.selectedGroups.map((g) => ({text: g, value: g}));
});
/*
const group_order_type = computed({
    get(): string {
        return $wstate.settings.group_order_type;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                group_order_type: value,
            },
        });
    },
});
const group_order_dataset = computed({
    get(): string {
        return $wstate.settings.group_order_dataset;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                group_order_dataset: value,
            },
        });
    },
});
*/
const syllable_order_type = computed({
    get(): OrderingType {
        return $wstate.settings.syllable_order_type;
    },
    set(value: OrderingType) {
        $wstate.updateComponentSettings({
            settings: {
                syllable_order_type: value,
            },
        });
    },
});
const syllable_order_group_value = computed({
    get(): string {
        return $wstate.settings.syllable_order_group_value;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                syllable_order_group_value: value.toString(),
            },
        });
    },
});
const syllable_order_diff_minuend = computed({
    get(): string {
        return $wstate.settings.syllable_order_diff_minuend;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                syllable_order_diff_minuend: value.toString(),
            },
        });
    },
});
const syllable_order_diff_subtrahend = computed({
    get(): string {
        return $wstate.settings.syllable_order_diff_subtrahend;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                syllable_order_diff_subtrahend: value.toString(),
            },
        });
    },
});
const syllable_order_direction = computed({
    get(): SortOrderDirection {
        return $wstate.settings.syllable_order_direction;
    },
    set(value: SortOrderDirection) {
        $wstate.updateComponentSettings({
            settings: {
                syllable_order_direction: value,
            },
        });
    },
});
const syllable_order_dataset = computed({
    get(): string {
        return $wstate.settings.syllable_order_dataset;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                syllable_order_dataset: value,
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
const point_size = computed({
    get(): number {
        return $wstate.settings.point_size;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                point_size: Number.parseInt(value, 10),
            },
        });
    },
});
const show_lines = computed({
    get(): boolean {
        return $wstate.settings.show_lines;
    },
    set(value: boolean) {
        $wstate.updateComponentSettings({
            settings: {
                show_lines: value,
            },
        });
    },
});
const line_weight = computed({
    get(): number {
        return $wstate.settings.line_weight;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                line_weight: Number.parseInt(value, 10),
            },
        });
    },
});
const show_errors = computed({
    get(): boolean {
        return $wstate.settings.show_errors;
    },
    set(value: boolean) {
        $wstate.updateComponentSettings({
            settings: {
                show_errors: value,
            },
        });
    },
});
const error_type = computed({
    get(): string {
        return $wstate.settings.error_type;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                error_type: value,
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