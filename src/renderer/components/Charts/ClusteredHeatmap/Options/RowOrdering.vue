<template>
    <BContainer fluid>
        <BRow>
            <BCol>
                <BInputGroup prepend="Row Ordering">
                    <BFormSelect v-model="row_order_type" :options="order_type_options" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="row_order_type === 'value'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Sort by">
                    <BFormSelect v-model="row_order_column_value" :options="column_options" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="row_order_type === 'value'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Direction">
                    <BFormSelect v-model="row_order_direction" :options="order_direction_options" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="row_order_type === 'hcluster'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Distance">
                    <BFormSelect v-model="row_cluster_distance" :options="cluster_distance_options" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="row_order_type === 'hcluster'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Linkage">
                    <BFormSelect v-model="row_cluster_linkage" :options="cluster_linkage_options" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="row_order_type === 'kcluster'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Number of Clusters (K)">
                    <b-form-input type="number" v-model="row_cluster_k" min="1" max="100" ></b-form-input>
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow v-show="row_order_type === 'dataset'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup prepend="Dataset">
                    <DatasetPicker v-model="row_order_dataset" :dataview="datasource" :owner="id" />
                </BInputGroup>
            </BCol>
        </BRow>
    </BContainer>
</template>

<script setup lang="ts">
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin'
import DatasetPicker from '@render/components/DatasetPicker.vue';
import { computed, watch } from 'vue'
import { OrderingType } from '../ClusteredHeatmap.types';
import { RowOrderingProps, CommonOrderingPropsDefaults, RowOrderingSettings } from './Options.types';
import { SortOrderDirection } from '../../common.types';

const props = withDefaults(defineProps<RowOrderingProps>(), CommonOrderingPropsDefaults);
const { $wstate, datasource } = useWindowMixin<RowOrderingSettings>(props.id);

const row_order_type = computed({
    get(): OrderingType {
        return $wstate.settings.row_order_type;
    },
    set(value: OrderingType) {
        if (value === $wstate.settings.row_order_type) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                row_order_type: value,
            },
        });
    },
});
const row_order_column_value = computed({
    get(): string {
        return $wstate.settings.row_order_column_value;
    },
    set(value: string) {
        if (value === $wstate.settings.row_order_column_value) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                row_order_column_value: value.toString(),
            },
        });
    },
});
const row_order_direction = computed({
    get(): SortOrderDirection {
        return $wstate.settings.row_order_direction;
    },
    set(value: SortOrderDirection) {
        if (value === $wstate.settings.row_order_direction) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                row_order_direction: value,
            },
        });
    },
});
const row_cluster_distance = computed({
    get(): string {
        return $wstate.settings.row_cluster_distance;
    },
    set(value: string) {
        if (value === $wstate.settings.row_cluster_distance) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                row_cluster_distance: value,
            },
        });
    },
});
const row_cluster_linkage = computed({
    get(): string {
        return $wstate.settings.row_cluster_linkage;
    },
    set(value: string) {
        if (value === $wstate.settings.row_cluster_linkage) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                row_cluster_linkage: value,
            },
        });
    },
});
const row_cluster_k = computed({
    get(): number {
        return $wstate.settings.row_cluster_k;
    },
    set(value: string) {
        const parsedValue = parseInt(value);
        if (parsedValue === $wstate.settings.row_cluster_k) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                row_cluster_k: parsedValue,
            },
        });
    },
});
const row_order_dataset = computed({
    get(): string {
        return $wstate.settings.row_order_dataset;
    },
    set(value: string) {
        if (value === $wstate.settings.row_order_dataset) {
            return;
        }
        $wstate.updateComponentSettings({
            settings: {
                row_order_dataset: value,
            },
        });
    },
});

watch(() => props.column_options, (newValue) => {
    if ((row_order_column_value.value === undefined || row_order_column_value.value === "") && props.column_options.length > 0) {
        row_order_column_value.value = newValue[0].value;
    }
}, { immediate: true, deep: true });

</script>