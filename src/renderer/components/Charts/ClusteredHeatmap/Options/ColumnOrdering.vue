<template>
    <BContainer fluid>
        <BRow>
            <BCol>
                <BInputGroup prepend="Column Ordering">
                    <BFormSelect v-model="column_order_type" :options="order_type_options" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="column_order_type === 'value'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Sort by">
                    <BFormSelect v-model="column_order_row_value" :options="row_options" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="column_order_type === 'value'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Direction">
                    <BFormSelect v-model="column_order_direction" :options="order_direction_options" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="column_order_type === 'hcluster'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Distance">
                    <BFormSelect v-model="column_cluster_distance" :options="cluster_distance_options" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="column_order_type === 'hcluster'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Linkage">
                    <BFormSelect v-model="column_cluster_linkage" :options="cluster_linkage_options" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="column_order_type === 'kcluster'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Number of Clusters (K)">
                    <BFormInput type="number" v-model="column_cluster_k" min="1" max="100" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="column_order_type === 'dataset'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Dataset">
                    <DatasetPicker v-model="column_order_dataset" :dataview="datasource" :owner="id" />
                </BInputGroup>
            </BCol>
        </BRow>
    </BContainer>
</template>

<script setup lang="ts">
import {useWindowMixin} from '@render/components/Core/Window/WindowMixin'
import DatasetPicker from '@render/components/DatasetPicker.vue';
import { computed, watch } from 'vue'
import { OrderingType, SortOrderDirection } from '../ClusteredHeatmap.types';
import { ColumnOrderingProps, CommonOrderingPropsDefaults, ColumnOrderingSettings } from './Options.types';


const props = withDefaults(defineProps<ColumnOrderingProps>(), CommonOrderingPropsDefaults);
const { $wstate, datasource } = useWindowMixin<ColumnOrderingSettings>(props.id);

const column_order_type = computed({
    get(): OrderingType {
        return $wstate.settings.column_order_type;
    },
    set(value: OrderingType) {
        if (value === $wstate.settings.column_order_type) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                column_order_type: value,
            },
        });
    },
});
const column_order_row_value = computed({
    get(): string {
        return $wstate.settings.column_order_row_value;
    },
    set(value: string) {
        if (value === $wstate.settings.column_order_row_value) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                column_order_row_value: value,
            },
        });
    },
});
const column_order_direction = computed({
    get(): SortOrderDirection {
        return $wstate.settings.column_order_direction;
    },
    set(value: SortOrderDirection) {
        if (value === $wstate.settings.column_order_direction) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                column_order_direction: value,
            },
        });
    },
});
const column_cluster_distance = computed({
    get(): string {
        return $wstate.settings.column_cluster_distance;
    },
    set(value: string) {
        if (value === $wstate.settings.column_cluster_distance) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                column_cluster_distance: value,
            },
        });
    },
});
const column_cluster_linkage = computed({
    get(): string {
        return $wstate.settings.column_cluster_linkage;
    },
    set(value: string) {
        if (value === $wstate.settings.column_cluster_linkage) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                column_cluster_linkage: value,
            },
        });
    },
});
const column_cluster_k = computed({
    get(): number {
        return $wstate.settings.column_cluster_k;
    },
    set(value: string) {
        const parsedValue = parseInt(value);
        if (parsedValue === $wstate.settings.column_cluster_k) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                column_cluster_k: parsedValue,
            },
        });
    },
});
const column_order_dataset = computed({
    get(): string {
        return $wstate.settings.column_order_dataset;
    },
    set(value: string) {
        if (value === $wstate.settings.column_order_dataset) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                column_order_dataset: value,
            },
        });
    },
});

watch(() => props.row_options, (newValue) => {
    if ((column_order_row_value.value === undefined || column_order_row_value.value === "") && newValue.length > 0) {
        column_order_row_value.value = newValue[0].value;
    }
}, { immediate: true, deep: true });

</script>