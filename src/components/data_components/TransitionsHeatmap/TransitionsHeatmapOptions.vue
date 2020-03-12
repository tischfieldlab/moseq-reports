<template>
    <b-container fluid>
        <b-row>
            <b-col>
                <b-input-group prepend="Colormap">
                    <b-form-select v-model="abs_colorscale" :options="color_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-form-checkbox switch v-model="show_relative_diff">Show Relative Differences</b-form-checkbox>
            </b-col>
        </b-row>
        <b-row v-show="show_relative_diff">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Relative To Group">
                    <b-form-select v-model="relative_diff_group" :options="relative_diff_group_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="show_relative_diff">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Relative Colormap">
                    <b-form-select v-model="rel_colorscale" :options="color_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <!--<b-row v-show="syllable_order_type === 'value'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Direction">
                    <b-form-select v-model="syllable_order_direction" :options="syllable_order_direction_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="syllable_order_type === 'cluster'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Distance">
                    <b-form-select v-model="syllable_cluster_distance" :options="cluster_distance_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="syllable_order_type === 'cluster'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Linkage">
                    <b-form-select v-model="syllable_cluster_linkage" :options="cluster_linkage_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Group Ordering">
                    <b-form-select v-model="group_order_type" :options="group_order_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="group_order_type === 'cluster'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Distance">
                    <b-form-select v-model="group_cluster_distance" :options="cluster_distance_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="group_order_type === 'cluster'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Linkage">
                    <b-form-select v-model="group_cluster_linkage" :options="cluster_linkage_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>-->
    </b-container>
</template>

<script scoped lang="ts">
import Vue from 'vue';
import {GetInterpolatedScaleOptions} from '@/util/D3ColorProvider';


export default Vue.component('transitions-heatmap-options', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    mounted() {
        this.populateGroups();
    },
    methods: {
        populateGroups() {
            this.relative_diff_group_options = this.selectedGroups.map((g) => ({text: g, value: g}));
            if (this.relative_diff_group === undefined) {
                this.relative_diff_group = this.relative_diff_group_options[0].value;
            }
        },
    },
    computed: {
        settings(): any {
            return this.$store.getters.getWindowById(this.id).settings;
        },
        selectedGroups(): string[] {
            return this.$store.state.dataview.selectedGroups;
        },
        abs_colorscale: {
            get(): string {
                return this.settings.abs_colormap;
            },
            set(value: string) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        abs_colormap: value,
                    },
                });
            },
        },
        rel_colorscale: {
            get(): string {
                return this.settings.rel_colormap;
            },
            set(value: string) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        rel_colormap: value,
                    },
                });
            },
        },
        show_relative_diff: {
            get(): boolean {
                return this.settings.show_relative_diff;
            },
            set(value: boolean) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        show_relative_diff: value,
                    },
                });
            },
        },
        relative_diff_group: {
            get(): string {
                return this.settings.relative_diff_group;
            },
            set(value: string) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        relative_diff_group: value,
                    },
                });
            },
        },
        /*syllable_order_type: {
            get(): OrderingType {
                return this.settings.syllable_order_type;
            },
            set(value: OrderingType) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        syllable_order_type: value,
                    },
                });
            },
        },
        syllable_order_group_value: {
            get(): string {
                return this.settings.syllable_order_group_value;
            },
            set(value: string) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        syllable_order_group_value: value,
                    },
                });
            },
        },
        syllable_order_direction: {
            get(): SortOrderDirection {
                return this.settings.syllable_order_direction;
            },
            set(value: SortOrderDirection) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        syllable_order_direction: value,
                    },
                });
            },
        },
        syllable_cluster_distance: {
            get(): string {
                return this.settings.syllable_cluster_distance;
            },
            set(value: string) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        syllable_cluster_distance: value,
                    },
                });
            },
        },
        syllable_cluster_linkage: {
            get(): string {
                return this.settings.syllable_cluster_linkage;
            },
            set(value: string) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        syllable_cluster_linkage: value,
                    },
                });
            },
        },
        group_order_type: {
            get(): OrderingType {
                return this.settings.group_order_type;
            },
            set(value: OrderingType) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        group_order_type: value,
                    },
                });
            },
        },
        group_cluster_distance: {
            get(): string {
                return this.settings.group_cluster_distance;
            },
            set(value: string) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        group_cluster_distance: value,
                    },
                });
            },
        },
        group_cluster_linkage: {
            get(): string {
                return this.settings.group_cluster_linkage;
            },
            set(value: string) {
                this.$store.commit('updateComponentSettings', {
                    id: this.id,
                    settings: {
                        group_cluster_linkage: value,
                    },
                });
            },
        },*/
    },
    data() {
        return {
            color_options: GetInterpolatedScaleOptions(),
            relative_diff_group_options: new Array<{text: string, value: string}>(),
            /*syllable_order_options: [
                { text: 'Syllable ID', value: OrderingType.Natural },
                { text: 'Syllable Value', value: OrderingType.Value },
                { text: 'Clustered', value: OrderingType.Cluster },
            ],
            syllable_order_direction_options: [
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
            group_order_options: [
                { text: 'Data Source Order', value: OrderingType.Natural },
                { text: 'Clustered', value: OrderingType.Cluster },
            ],*/
        };
    },
});
</script>

<style lang="scss" scoped>
.row{
    margin:10px 0;
}
</style>
