<template>
    <b-container fluid>
        <b-row>
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
                <b-input-group prepend="Boxplot Whiskers">
                    <b-form-select v-model="boxplot_whiskers" :options="whisker_options" :disabled="!show_boxplot"></b-form-select>
                    <b-input-group-append is-text>
                        <b-form-checkbox v-model="show_boxplot" switch />
                    </b-input-group-append>
                </b-input-group>
                <div class="figure-caption" v-html="boxplot_whisker_description"></div>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Violin Scale">
                    <b-form-input type="number" v-model="violin_kde_scale" :disabled="!show_violinplot" min="0" max="1.0" step="0.001" ></b-form-input>
                    <b-input-group-append is-text>
                        <b-form-checkbox v-model="show_violinplot" switch />
                    </b-input-group-append>
                </b-input-group>
            </b-col>
        </b-row>
    </b-container>
</template>

<script scoped lang="ts">
import Vue from 'vue';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';
import {WhiskerType} from '@/components/Charts/BoxPlot';
import {OrderingType} from '@/components/Charts/ClusteredHeatmap';
import DatasetPicker from '@/components/DatasetPicker.vue';


export default mixins(WindowMixin).extend({
    components: {
        DatasetPicker,
    },
    computed: {
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
        show_boxplot: {
            get(): boolean {
                return this.settings.show_boxplot;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        show_boxplot: value,
                    },
                });
            },
        },
        boxplot_whiskers: {
            get(): WhiskerType {
                return this.settings.boxplot_whiskers;
            },
            set(value: WhiskerType) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        boxplot_whiskers: value,
                    },
                });
            },
        },
        boxplot_whisker_description: {
            get(): string {
                return this.whisker_options.find((wo) => wo.value === this.boxplot_whiskers)!.description;
            },
        },
        show_violinplot: {
            get(): boolean {
                return this.settings.show_violinplot;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        show_violinplot: value,
                    },
                });
            },
        },
        violin_kde_scale: {
            get(): number {
                return this.settings.violin_kde_scale;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        violin_kde_scale: Number.parseFloat(value),
                    },
                });
            },
        },
    },
    data() {
        return {
            whisker_options: [
                {
                    value: WhiskerType.TUKEY,
                    text: 'Tukey',
                    description: 'Whiskers extend up to 1.5 * IQR from 25<sup>th</sup> and 75<sup>th</sup> percentile',
                }, {
                    value: WhiskerType.MIN_MAX,
                    text: 'Min/Max',
                    description: 'Whiskers extend to min and max data points',
                },
            ],
            group_order_options: [
                { text: 'Filter Order', value: OrderingType.Natural },
                { text: 'Dataset', value: OrderingType.Dataset },
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