<template>
    <b-container fluid>
        <b-row>
            <b-col>
                <b-input-group prepend="Row Ordering">
                    <b-form-select v-model="row_order_type" :options="order_type_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="row_order_type === 'value'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Sort by">
                    <b-form-select v-model="row_order_column_value" :options="column_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="row_order_type === 'value'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Direction">
                    <b-form-select v-model="row_order_direction" :options="order_direction_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="row_order_type === 'hcluster'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Distance">
                    <b-form-select v-model="row_cluster_distance" :options="cluster_distance_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="row_order_type === 'hcluster'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Linkage">
                    <b-form-select v-model="row_cluster_linkage" :options="cluster_linkage_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="row_order_type === 'kcluster'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Number of Clusters (K)">
                    <b-form-input type="number" v-model="row_cluster_k" min="1" max="100" ></b-form-input>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="row_order_type === 'dataset'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Dataset">
                    <DatasetPicker v-model="row_order_dataset" :dataview="dataview" :owner="subid" />
                </b-input-group>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import WindowMixin from '@/components/Core/Window/WindowMixin'
import mixins from 'vue-typed-mixins';
import DatasetPicker from '@/components/DatasetPicker.vue';

import Vue, { PropType } from 'vue'
import { OrderingType, SortOrderDirection } from '../ClusteredHeatmap.types';




export default mixins(WindowMixin).extend({
    components: {
        DatasetPicker,
    },
    props: {
        column_options: {
            type: Array as PropType<{text: string, value: string}[]>,
            default() {
                return [];
            },
        },
        order_type_options: {
            type: Array,
            default() {
                return [
                    { text: 'ID', value: OrderingType.Natural },
                    { text: 'Value', value: OrderingType.Value },
                    { text: 'Hierarchical Cluster', value: OrderingType.HCluster },
                    { text: 'K-means Cluster', value: OrderingType.KCluster },
                    { text: 'Dataset', value: OrderingType.Dataset },
                ];
            },
        },
        order_direction_options: {
            type: Array,
            default() {
                return [
                    { text: 'Ascending', value: SortOrderDirection.Asc },
                    { text: 'Descending', value: SortOrderDirection.Dec },
                ];
            },
        },
        cluster_distance_options: {
            type: Array,
            default() {
                return [
                    { text: 'Euclidean', value: 'euclidean' },
                    // { text: 'Manhattan', value: 'manhattan' },
                    // { text: 'Chebyshev', value: 'chebyshev' },
                    // { text: 'Cosine', value: 'cosine' },
                    { text: 'Angular', value: 'angular' },
                ];
            },
        },
        cluster_linkage_options: {
            type: Array,
            default() {
                return [
                    { text: 'Average', value: 'avg' },
                    { text: 'Maximum', value: 'max' },
                    { text: 'Minimum', value: 'min' },
                ];
            },
        },
    },
    watch: {
        column_options: {
            handler() {
                if (this.row_order_column_value === undefined && this.column_options.length > 0) {
                    this.row_order_column_value = this.column_options[0].value;
                }
            },
            deep: true,
            immediate: true,
        },
    },
    computed: {
        row_order_type: {
            get(): OrderingType {
                return this.settings.row_order_type;
            },
            set(value: OrderingType) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        row_order_type: value,
                    },
                });
            },
        },
        row_order_column_value: {
            get(): string {
                return this.settings.row_order_column_value;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        row_order_column_value: value.toString(),
                    },
                });
            },
        },
        row_order_direction: {
            get(): SortOrderDirection {
                return this.settings.row_order_direction;
            },
            set(value: SortOrderDirection) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        row_order_direction: value,
                    },
                });
            },
        },
        row_cluster_distance: {
            get(): string {
                return this.settings.row_cluster_distance;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        row_cluster_distance: value,
                    },
                });
            },
        },
        row_cluster_linkage: {
            get(): string {
                return this.settings.row_cluster_linkage;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        row_cluster_linkage: value,
                    },
                });
            },
        },
        row_cluster_k: {
            get(): number {
                return this.settings.row_cluster_k;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        row_cluster_k: Number.parseInt(value, 10),
                    },
                });
            },
        },
        row_order_dataset: {
            get(): string {
                return this.settings.row_order_dataset;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        row_order_dataset: value,
                    },
                });
            },
        },
    },
});
</script>