<template>
    <b-container fluid>
        <b-row>
            <b-col>
                <b-input-group prepend="Behavioral Distance Metric">
                    <b-form-select v-model="distance_metric" :options="method_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Colormap">
                    <ColorScalePicker v-model="colorscale" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Row Ordering">
                    <b-form-select v-model="row_order_type" :options="row_order_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="row_order_type === 'value'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Sort by Syllable">
                    <b-form-select v-model="row_order_col_value" :options="group_options"></b-form-select>
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
        <b-row v-show="row_order_type === 'cluster'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Distance">
                    <b-form-select v-model="row_cluster_distance" :options="cluster_distance_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="row_order_type === 'cluster'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Linkage">
                    <b-form-select v-model="row_cluster_linkage" :options="cluster_linkage_options"></b-form-select>
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
        <b-row>
            <b-col>
                <b-input-group prepend="Column Ordering">
                    <b-form-select v-model="column_order_type" :options="column_order_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="column_order_type === 'value'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Sort by Syllable">
                    <b-form-select v-model="column_order_row_value" :options="group_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="column_order_type === 'value'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Direction">
                    <b-form-select v-model="column_order_direction" :options="order_direction_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="column_order_type === 'cluster'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Distance">
                    <b-form-select v-model="column_cluster_distance" :options="cluster_distance_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="column_order_type === 'cluster'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Linkage">
                    <b-form-select v-model="column_cluster_linkage" :options="cluster_linkage_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="column_order_type === 'dataset'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Dataset">
                    <DatasetPicker v-model="column_order_dataset" :dataview="dataview" :owner="subid" />
                </b-input-group>
            </b-col>
        </b-row>
    </b-container>
</template>

<script scoped lang="ts">
import Vue from 'vue';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';
import {OrderingType, SortOrderDirection} from '@/components/Charts/ClusteredHeatmap/ClusterHeatmap.types';
import DatasetPicker from '@/components/DatasetPicker.vue';
import { CountMethod } from '../../../store/dataview.types';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import ColorScalePicker from '@/components/ColorScalePicker.vue';


export default mixins(WindowMixin).extend({
    components: {
        ColorScalePicker,
        DatasetPicker,
    },
    watch: {
        method_options_spec: {
            async handler(newValue) {
                this.method_options = await LoadData(this.method_options_spec[0], this.method_options_spec[1]);
            },
            immediate: true,
        },
    },
    computed: {
        method_options_spec(): any[] {
            let ds;
            if (this.dataview.countMethod === CountMethod.Usage) {
                ds = this.$store.getters[`datasets/resolve`]('behave_dist_usage');
            } else if (this.dataview.countMethod === CountMethod.Frames) {
                ds = this.$store.getters[`datasets/resolve`]('behave_dist_frames');
            } else {
                throw new Error(`Count method ${this.dataview.countMethod} is not supported`);
            }
            return [ds, [{ type: 'keys' }]];
        },
        group_options(): string[] {
            let vals;
            if (this.dataview.moduleIdFilter.length === 0) {
                vals = this.$store.getters[`${this.datasource}/availableModuleIds`];
            } else {
                vals = this.dataview.moduleIdFilter;
            }
            return vals.map((g) => ({text: g, value: g}));
        },
        colorscale: {
            get(): string {
                return this.settings.colormap;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        colormap: value,
                    },
                });
            },
        },
        distance_metric: {
            get(): string {
                return this.settings.distance_metric;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        distance_metric: value,
                    },
                });
            },
        },
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
        row_order_col_value: {
            get(): string {
                return this.settings.row_order_col_value;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        row_order_col_value: value,
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
        column_order_type: {
            get(): OrderingType {
                return this.settings.column_order_type;
            },
            set(value: OrderingType) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        column_order_type: value,
                    },
                });
            },
        },
        column_order_row_value: {
            get(): string {
                return this.settings.column_order_row_value;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        column_order_row_value: value,
                    },
                });
            },
        },
        column_order_direction: {
            get(): SortOrderDirection {
                return this.settings.column_order_direction;
            },
            set(value: SortOrderDirection) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        column_order_direction: value,
                    },
                });
            },
        },
        column_cluster_distance: {
            get(): string {
                return this.settings.column_cluster_distance;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        column_cluster_distance: value,
                    },
                });
            },
        },
        column_cluster_linkage: {
            get(): string {
                return this.settings.column_cluster_linkage;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        column_cluster_linkage: value,
                    },
                });
            },
        },
        column_order_dataset: {
            get(): string {
                return this.settings.column_order_dataset;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        column_order_dataset: value,
                    },
                });
            },
        },
    },
    data() {
        return {
            method_options: [] as string[],
            row_order_options: [
                { text: 'Syllable ID', value: OrderingType.Natural },
                { text: 'Distance Value', value: OrderingType.Value },
                { text: 'Clustered', value: OrderingType.Cluster },
                { text: 'Dataset', value: OrderingType.Dataset },
            ],
            order_direction_options: [
                { text: 'Ascending', value: SortOrderDirection.Asc },
                { text: 'Descending', value: SortOrderDirection.Dec },
            ],
            cluster_distance_options: [
                { text: 'Euclidean', value: 'euclidean' },
                // { text: 'Manhattan', value: 'manhattan' },
                // { text: 'Chebyshev', value: 'chebyshev' },
                // { text: 'Cosine', value: 'cosine' },
                { text: 'Angular', value: 'angular' },
            ],
            cluster_linkage_options: [
                { text: 'Average', value: 'avg' },
                { text: 'Maximum', value: 'max' },
                { text: 'Minimum', value: 'min' },
            ],
            column_order_options: [
                { text: 'Syllable ID', value: OrderingType.Natural },
                { text: 'Distance Value', value: OrderingType.Value },
                { text: 'Clustered', value: OrderingType.Cluster },
                { text: 'Dataset', value: OrderingType.Dataset },
            ],
        };
    },
});
</script>

<style scoped>
.row{
    margin:10px 0;
}
</style>
