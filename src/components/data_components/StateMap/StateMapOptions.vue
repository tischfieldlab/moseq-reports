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
                    <b-form-select v-model="layout" :options="available_layouts"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-if="layout === 'fcose' || layout === 'cise'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Node Separation">
                    <b-form-input v-model="node_separation" type="number" :number="true" step="10" min="0" max="1000"/>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-if="layout === 'fcose' || layout === 'cise'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Node Repulsion">
                    <b-form-input v-model="node_repulsion" type="number" :number="true" step="100" min="0" max="10000"/>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-if="layout === 'fcose' || layout === 'cise'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Ideal Edge Length">
                    <b-form-input v-model="ideal_edge_length" type="number" :number="true" step="5" min="0" max="100"/>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-if="layout === 'fcose' || layout === 'cise'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Edge Elasticity">
                    <b-form-input v-model="edge_elasticity" type="number" :number="true" step=".1" min="0" max="1"/>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-if="layout === 'fcose' || layout === 'cise'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Gravity Range">
                    <b-form-input v-model="gravity_range" type="number" :number="true" step="1" min="0" max="30"/>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="layout === 'fcose'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Sample Size">
                    <b-form-input v-model="sample_size" type="number" :number="true" step="10" min="0" max="1000" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="layout === 'fcose'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Gravity Range Compound">
                    <b-form-input v-model="gravity_range_compound" type="number" :number="true" step="1" min="0" max="20" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="layout === 'cise'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Spring Coefficient">
                    <b-form-input v-model="spring_coeff" type="number" :number="true" step=".01" min="0" max=".1" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="layout === 'cise'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="gravity">
                    <b-form-input v-model="gravity" type="number" :number="true" step=".1" min="0" max="1" />
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
        layout: {
            get(): string {
                return this.settings.layout;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        layout: value,
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
        node_separation: {
            get(): number {
                return this.settings.node_separation;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        node_separation: value,
                    },
                });
            },
        },
        node_repulsion: {
            get(): number {
                return this.settings.node_repulsion;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        node_repulsion: value,
                    },
                });
            },
        },
        ideal_edge_length: {
            get(): number {
                return this.settings.ideal_edge_length;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        ideal_edge_length: value,
                    },
                });
            },
        },
        edge_elasticity: {
            get(): number {
                return this.settings.edge_elasticity;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        edge_elasticity: value,
                    },
                });
            },
        },
        gravity_range: {
            get(): number {
                return this.settings.gravity_range;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        gravity_range: value,
                    },
                });
            },
        },
        sample_size: {
            get(): number {
                return this.settings.sample_size;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        sample_size: value,
                    },
                });
            },
        },
        gravity_range_compound: {
            get(): number {
                return this.settings.gravity_range_compound;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        gravity_range_compound: value,
                    },
                });
            },
        },
        spring_coeff: {
            get(): number {
                return this.settings.spring_coeff;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        spring_coeff: value,
                    },
                });
            },
        },
        gravity: {
            get(): number {
                return this.settings.gravity;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        gravity: value,
                    },
                });
            },
        },
    },
    data() {
        return {
            available_layouts: [
                'grid', 'circle', 'concentric', 'avsdf', 'fcose', 'cise',
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