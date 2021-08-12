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
                <div v-show="show_boxplot" class="figure-caption">{{ boxplot_whisker_description }}</div>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Violin KDE Scale">
                    <b-form-input type="number" v-model.number="kde_scale" :disabled="!show_violinplot" min="0.0" step="0.001" max="1" debounce="300" ></b-form-input>
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
import {availableMetrics} from './ScalarData.types';


export default mixins(WindowMixin).extend({
    computed: {
        metric: {
            get(): string {
                return this.settings.metric;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        metric: value,
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
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        point_size: value,
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
        kde_scale: {
            get(): number {
                return this.settings.kde_scale;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        kde_scale: value,
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
                    description: 'Whiskers extend up to 1.5 * IQR from 25th and 75th percentile',
                }, {
                    value: WhiskerType.MIN_MAX,
                    text: 'Min/Max',
                    description: 'Whiskers extend to min and max data points',
                },
            ],
            metric_options: Object.entries(availableMetrics)
                                  .map(([metric, info]) => ({value: metric, text: info.title})),
        };
    },
});
</script>

<style lang="scss" scoped>
.row {
    margin:10px 0;
}
</style>