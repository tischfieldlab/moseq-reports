<template>
    <div>
        <Colormap :id="id" />
        <RowOrdering :id="id" :column_options="availableUUIDs" />
        <ColumnOrdering :id="id" :row_options="column_order_row_value_options" />
        <BRow>
            <BCol>
                <BInputGroup prepend="Color Column Labels">
                    <BFormSelect v-model="color_columns_data" :options="color_columns_data_options" :disabled="!color_columns" />
                    <BInputGroupText is-text>
                        <b-form-checkbox v-model="color_columns" switch />
                    </BInputGroupText>
                </BInputGroup>
            </BCol>
        </BRow>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import {Colormap, ColumnOrdering, RowOrdering} from '@render/components/Charts/ClusteredHeatmap';
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";
import { UsageHeatmapSettings } from './IndividualUsageHeatmap.types';
import DataService, { Operation } from '@render/api';

const props = defineProps<{
    id: string;
}>();

const {$wstate, dataview} = useWindowMixin<UsageHeatmapSettings>(props.id);

const availableUUIDs = ref<{text: string, value: string}[]>([]);

const column_order_row_value_options = computed((): {text: string, value: string}[] => {
    return dataview.value.selectedSyllables.map((s) => ({text: `${s}`, value: `${s}`}));
});
const uuidSourceData = computed((): Operation[] => {
    const filters: Operation[] = [
        {
            type: 'map',
        },
        {
            type: 'pluck',
            column: 'uuid',
        },
    ];
    return filters;
});
const color_columns_data_options = computed((): {text: string, value: string}[] => {
    return [
        { text: 'Group', value: 'group' },
    ];
});
const color_columns = computed({
    get(): boolean {
        return $wstate.settings.color_columns;
    },
    set(value: boolean) {
        $wstate.updateComponentSettings({
            settings: {
                color_columns: value,
            },
        });
    },
});
const color_columns_data = computed({
    get(): string {
        return $wstate.settings.color_columns_data;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                color_columns_data: value,
            },
        });
    },
});

watchEffect(async () => {
    DataService.fetchData<any>('samples', uuidSourceData.value)
        .then((data) => {
            availableUUIDs.value = data.map((uuid) => {
                uuid = uuid.split('-').pop()
                return {text: uuid, value: uuid};
            });
        });
});
</script>

<style scoped>
.row{
    margin:10px 0;
}
</style>