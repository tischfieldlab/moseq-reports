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
        <b-row v-show="show_relative_diff">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Colormap" style="flex-wrap:nowrap">
                    <ColorScalePicker v-model="colorscale" />
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
                <b-input-group prepend="Node Alignment">
                    <b-form-select v-model="node_alignment" :options="alignment_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Node Width">
                    <b-form-input v-model="node_width" type="number" :number="true" step="1" min="5" max="50" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Node Padding">
                    <b-form-input v-model="node_padding" type="number" :number="true" step="1" min="0" max="50" />
                </b-input-group>
            </b-col>
        </b-row>
    </b-container>
</template>

<script scoped lang="ts">
import Vue from 'vue';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/Window/WindowMixin';
import ColorScalePicker from '@/components/Charts/Colors/ColorScalePicker.vue';
import {NodeAlignment} from '@/components/Charts/Sankey/Sankey.types';



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
        node_width: {
            get(): number {
                return this.settings.node_width;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        node_width: value,
                    },
                });
            },
        },
        node_padding: {
            get(): number {
                return this.settings.node_padding;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        node_padding: value,
                    },
                });
            },
        },
        node_alignment: {
            get(): string {
                return this.settings.node_alignment;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        node_alignment: value,
                    },
                });
            },
        },
    },
    data() {
        return {
            alignment_options: [
                { text: NodeAlignment.Justify, value: NodeAlignment.Justify },
                { text: NodeAlignment.Left, value: NodeAlignment.Left },
                { text: NodeAlignment.Right, value: NodeAlignment.Right },
                { text: NodeAlignment.Center, value: NodeAlignment.Center },
            ]
        };
    },
});
</script>

<style scoped>
.row {
    margin:10px 0;
}
</style>