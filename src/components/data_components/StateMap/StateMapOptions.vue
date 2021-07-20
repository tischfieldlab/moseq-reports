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
        <!-- grid layout settings -->
        <b-row v-if="layout === 'grid'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-form-checkbox switch v-model="grid_avoid_overlap">Avoid Overlap</b-form-checkbox>
            </b-col>
        </b-row>
        <b-row v-if="layout === 'grid' && grid_avoid_overlap === true">
            <b-col cols="2"></b-col>
            <b-col>
                <b-input-group prepend="Avoid Overlap Padding">
                    <b-form-input v-model="grid_avoid_overlap_padding" type="number" :number="true" step="10" min="0" max="150"/>
                </b-input-group>
            </b-col>
        </b-row>
        <!-- circle layout settings -->
        <b-row v-if="layout === 'circle'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-form-checkbox switch v-model="circle_avoid_overlap">Avoid Overlap</b-form-checkbox>
            </b-col>
        </b-row>
        <b-row v-if="layout === 'circle'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-form-checkbox switch v-model="circle_clockwise">Clockwise</b-form-checkbox>
            </b-col>
        </b-row>
        <!-- concentric layout settings -->
        <b-row v-if="layout === 'concentric'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-form-checkbox switch v-model="concentric_avoid_overlap">Avoid Overlap</b-form-checkbox>
            </b-col>
        </b-row>
        <b-row v-if="layout === 'concentric'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-form-checkbox switch v-model="concentric_clockwise">Clockwise</b-form-checkbox>
            </b-col>
        </b-row>
        <b-row v-if="layout === 'concentric'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-form-checkbox switch v-model="concentric_equidistant">Equidistant</b-form-checkbox>
            </b-col>
        </b-row>
        <b-row v-if="layout === 'concentric'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Minimum Node Spacing">
                    <b-form-input v-model="concentric_min_node_spacing" type="number" :number="true" step="10" min="0" max="100"/>
                </b-input-group>
            </b-col>
        </b-row>
        <!-- avsdf layout settings -->
        <b-row v-if="layout === 'avsdf'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Node Separation">
                    <b-form-input v-model="avsdf_node_separation" type="number" :number="true" step="10" min="0" max="200"/>
                </b-input-group>
            </b-col>
        </b-row>
        <!-- fcose layout settings -->
        <b-row v-if="layout === 'fcose'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Node Separation">
                    <b-form-input v-model="fcose_node_separation" type="number" :number="true" step="10" min="0" max="1000"/>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-if="layout === 'fcose'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Node Repulsion">
                    <b-form-input v-model="fcose_node_repulsion" type="number" :number="true" step="100" min="0" max="10000"/>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-if="layout === 'fcose'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Ideal Edge Length">
                    <b-form-input v-model="fcose_ideal_edge_length" type="number" :number="true" step="5" min="0" max="100"/>
                </b-input-group>
            </b-col>
        </b-row>
        <!-- cise layout settings -->
        <b-row v-if="layout === 'cise'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Node Separation">
                    <b-form-input v-model="cise_node_separation" type="number" :number="true" step="1" min="0" max="100"/>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-if="layout === 'cise'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Node Repulsion">
                    <b-form-input v-model="cise_node_repulsion" type="number" :number="true" step="1" min="0" max="100"/>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-if="layout === 'cise'">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Ideal Edge Length">
                    <b-form-input v-model="cise_ideal_edge_length" type="number" :number="true" step="1" min="0" max="100"/>
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
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';
import ColorScalePicker from '@/components/Charts/Colors/ColorScalePicker.vue';


export default mixins(WindowMixin).extend({
    components: {
        ColorScalePicker,
    },
    methods: {},
    computed: {
        available_groups(): Array<{text: string, value: string}> {
            return this.dataview.selectedGroups.map((g) => ({text: g, value: g}));
        },
        available_diff_groups(): Array<any> {
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
        // grid
        grid_avoid_overlap: {
            get(): boolean {
                return this.settings.grid_settings.avoid_overlap;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        grid_settings: {
                            avoid_overlap: value,
                        },
                    },
                });
            },
        },
        grid_avoid_overlap_padding: {
            get(): number {
                return this.settings.grid_settings.avoid_overlap_padding;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        grid_settings: {
                            avoid_overlap_padding: value,
                        },
                    },
                });
            },
        },
        // circle
        circle_avoid_overlap: {
            get(): boolean {
                return this.settings.circle_settings.avoid_overlap;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        circle_settings: {
                            avoid_overlap: value,
                        },
                    },
                });
            },
        },
        circle_clockwise: {
            get(): boolean {
                return this.settings.circle_settings.clockwise;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        circle_settings: {
                            clockwise: value,
                        },
                    },
                });
            },
        },
        // concentric
        concentric_avoid_overlap: {
            get(): boolean {
                return this.settings.concentric_settings.avoid_overlap;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        concentric_settings: {
                            avoid_overlap: value,
                        },
                    },
                });
            },
        },
        concentric_clockwise: {
            get(): boolean {
                return this.settings.concentric_settings.clockwise;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        concentric_settings: {
                            clockwise: value,
                        },
                    },
                });
            },
        },
        concentric_equidistant: {
            get(): boolean {
                return this.settings.concentric_settings.equidistant;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        concentric_settings: {
                            equidistant: value,
                        },
                    },
                });
            },
        },
        concentric_min_node_spacing: {
            get(): number {
                return this.settings.concentric_settings.min_node_spacing;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        concentric_settings: {
                            min_node_spacing: value,
                        },
                    },
                });
            },
        },
        // avsdf
        avsdf_node_separation: {
            get(): number {
                return this.settings.avsdf_settings.node_separation;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        avsdf_settings: {
                            node_separation: value,
                        },
                    },
                });
            },
        },
        // fcose
        fcose_node_separation: {
            get(): number {
                return this.settings.fcose_settings.node_separation;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        fcose_settings: {
                            node_separation: value,
                        },
                    },
                });
            },
        },
        fcose_node_repulsion: {
            get(): number {
                return this.settings.fcose_settings.node_repulsion;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        fcose_settings: {
                            node_repulsion: value,
                        },
                    },
                });
            },
        },
        fcose_ideal_edge_length: {
            get(): number {
                return this.settings.fcose_settings.ideal_edge_length;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        fcose_settings: {
                            ideal_edge_length: value,
                        },
                    },
                });
            },
        },
        // cise
        cise_node_separation: {
            get(): number {
                return this.settings.cise_settings.node_separation;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        cise_settings: {
                            node_separation: value,
                        },
                    },
                });
            },
        },
        cise_node_repulsion: {
            get(): number {
                return this.settings.cise_settings.node_repulsion;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        cise_settings: {
                            node_repulsion: value,
                        },
                    },
                });
            },
        },
        cise_ideal_edge_length: {
            get(): number {
                return this.settings.cise_settings.ideal_edge_length;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        cise_settings: {
                            ideal_edge_length: value,
                        },
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