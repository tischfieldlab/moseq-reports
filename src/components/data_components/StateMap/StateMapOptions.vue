<template>
    <b-container fluid>
        <b-row>
            <b-col>
                <b-input-group prepend="Group to plot">
                    <b-form-select v-model="plot_group" :options="available_groups"></b-form-select>
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
                    <b-form-select v-model="relative_diff_group" :options="available_diff_groups"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Prune Transitions Threshold">
                    <b-form-input v-model="prune_threshold" type="number" :number="true" step="0.001" min="0" max="1" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Layout">
                    <b-form-select v-model="graph_layout" :options="available_layouts"></b-form-select>
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
                <b-form-checkbox switch v-model="use_opacity">Use Transparency</b-form-checkbox>
            </b-col>
        </b-row>
    </b-container>
</template>

<script scoped lang="ts">
import Vue from 'vue';
import {GetInterpolatedScaleOptions} from '@/components/Charts/D3ColorProvider';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';
import ColorScalePicker from '@/components/ColorScalePicker.vue';


export default mixins(WindowMixin).extend({
    components: {
        ColorScalePicker,
    },
    methods: {},
    computed: {
        available_groups(): {text: string, value: string}[] {
            return this.dataview.selectedGroups.map((g) => ({text: g, value: g}));
        },
        available_diff_groups(): any[] {
            return this.dataview.selectedGroups
                    .map((g) => ({text: g, value: g}))
                    .filter((el) => el.value !== this.plot_group);
        },
        plot_group: {
            get(): string {
                return this.settings.plot_group;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        plot_group: value,
                    },
                });
            },
        },
        show_relative_diff: {
            get(): boolean {
                return this.settings.show_relative_diff;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
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
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        relative_diff_group: value,
                    },
                });
            },
        },
        prune_threshold: {
            get(): number {
                return this.settings.prune_threshold;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        prune_threshold: value,
                    },
                });
            },
        },
        graph_layout: {
            get(): string {
                return this.settings.graph_layout;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        graph_layout: value,
                    },
                });
            },
        },
        colorscale: {
            get(): string {
                return this.settings.colorscale;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        colorscale: value,
                    },
                });
            },
        },
        use_opacity: {
            get(): boolean {
                return this.settings.use_opacity;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        use_opacity: value,
                    },
                });
            },
        },
    },
    data() {
        return {
            available_layouts: [
                'grid', 'circle', 'concentric', 'avsdf',
            ],
        };
    },
});
</script>

<style scoped>
.row {
    margin:10px 0;
}
</style>