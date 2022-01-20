<template>
    <b-container fluid>
        <!--<b-row>
            <b-col>
                <b-input-group prepend="Group Ordering">
                    <b-form-select v-model="group_order_type" :options="group_order_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="group_order_type === 'dataset'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Dataset">
                    <DatasetPicker v-model="group_order_dataset" :dataview="dataview" :owner="subid" />
                </b-input-group>
            </b-col>
        </b-row>-->
        <b-row>
            <b-col>
                <b-input-group prepend="Module Ordering">
                    <b-form-select v-model="syllable_order_type" :options="syllable_order_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="syllable_order_type === 'value'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Sort by">
                    <b-form-select v-model="syllable_order_group_value" :options="group_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="syllable_order_type === 'value'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Direction">
                    <b-form-select v-model="syllable_order_direction" :options="order_direction_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="syllable_order_type === 'computed'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Minuend Group">
                    <b-form-select v-model="syllable_order_diff_minuend" :options="group_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="syllable_order_type === 'computed'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Subtrahend Group">
                    <b-form-select v-model="syllable_order_diff_subtrahend" :options="group_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="syllable_order_type === 'dataset'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Dataset">
                    <DatasetPicker v-model="syllable_order_dataset" :dataview="dataview" :owner="subid" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Point Size">
                    <b-form-input type="number" v-model="point_size" :disabled="!show_points" min="1" max="10" ></b-form-input>
                    <b-input-group-append is-text>
                        <b-form-checkbox v-model="show_points" switch />
                    </b-input-group-append>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Line Weight">
                    <b-form-input type="number" v-model="line_weight" :disabled="!show_lines" min="1" max="10" ></b-form-input>
                    <b-input-group-append is-text>
                        <b-form-checkbox v-model="show_lines" switch />
                    </b-input-group-append>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Error Bars">
                    <!-- not used yet -->
                    <b-form-select v-model="error_type" :options="error_type_options" :disabled="!show_errors"></b-form-select>
                    <b-input-group-append is-text>
                        <b-form-checkbox v-model="show_errors" switch />
                    </b-input-group-append>
                </b-input-group>
            </b-col>
        </b-row>
    </b-container>
</template>

<script scoped lang="ts">
import Vue from 'vue';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/Window/WindowMixin';
import {OrderingType, SortOrderDirection} from '@/components/Charts/ClusteredHeatmap';
import DatasetPicker from '@/components/DatasetPicker.vue';


export default mixins(WindowMixin).extend({
    components: {
        DatasetPicker,
    },
    mounted() {
        if (this.syllable_order_group_value === undefined) {
            this.syllable_order_group_value = this.group_options[0].value;
        }
        if (this.syllable_order_diff_minuend === undefined) {
            this.syllable_order_diff_minuend = this.group_options[0].value;
        }
        if (this.syllable_order_diff_subtrahend === undefined) {
            this.syllable_order_diff_subtrahend = this.group_options[0].value;
        }
    },
    computed: {
        group_options(): {text: string, value: string}[] {
            return this.dataview.selectedGroups.map((g) => ({text: g, value: g}));
        },
        group_order_type: {
            get(): string {
                return this.settings.group_order_type;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        group_order_type: value,
                    },
                });
            },
        },
        group_order_dataset: {
            get(): string {
                return this.settings.group_order_dataset;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        group_order_dataset: value,
                    },
                });
            },
        },
        syllable_order_type: {
            get(): string {
                return this.settings.syllable_order_type;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
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
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        syllable_order_group_value: value.toString(),
                    },
                });
            },
        },
        syllable_order_diff_minuend: {
            get(): string {
                return this.settings.syllable_order_diff_minuend;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        syllable_order_diff_minuend: value.toString(),
                    },
                });
            },
        },
        syllable_order_diff_subtrahend: {
            get(): string {
                return this.settings.syllable_order_diff_subtrahend;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        syllable_order_diff_subtrahend: value.toString(),
                    },
                });
            },
        },
        syllable_order_direction: {
            get(): SortOrderDirection {
                return this.settings.syllable_order_direction;
            },
            set(value: SortOrderDirection) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        syllable_order_direction: value,
                    },
                });
            },
        },
        syllable_order_dataset: {
            get(): string {
                return this.settings.syllable_order_dataset;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        syllable_order_dataset: value,
                    },
                });
            },
        },
        show_points: {
            get(): boolean {
                return this.settings.show_points;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        show_points: value,
                    },
                });
            },
        },
        point_size: {
            get(): number {
                return this.settings.point_size;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        point_size: Number.parseInt(value, 10),
                    },
                });
            },
        },
        show_lines: {
            get(): boolean {
                return this.settings.show_lines;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        show_lines: value,
                    },
                });
            },
        },
        line_weight: {
            get(): number {
                return this.settings.line_weight;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        line_weight: Number.parseInt(value, 10),
                    },
                });
            },
        },
        show_errors: {
            get(): boolean {
                return this.settings.show_errors;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        show_errors: value,
                    },
                });
            },
        },
        error_type: {
            get(): string {
                return this.settings.error_type;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        error_type: value,
                    },
                });
            },
        },
    },
    data() {
        return {
            group_order_options: [
                { text: 'Filter Order', value: OrderingType.Natural },
                { text: 'Dataset', value: OrderingType.Dataset },
            ],
            syllable_order_options: [
                { text: 'ID', value: OrderingType.Natural },
                { text: 'Value', value: OrderingType.Value },
                { text: 'Value Difference', value: OrderingType.Computed },
                { text: 'Dataset', value: OrderingType.Dataset },
            ],
            order_direction_options: [
                { text: 'Ascending', value: SortOrderDirection.Asc },
                { text: 'Descending', value: SortOrderDirection.Dec },
            ],
            error_type_options: [
                { text: 'SEM', value: 'sem' },
                { text: '95% CI', value: 'ci95' },
            ],
        };
    },
});
</script>

<style lang="scss" scoped>
.row {
    margin:10px 0;
}
</style>