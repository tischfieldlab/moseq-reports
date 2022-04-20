<template>
    <b-container fluid>
        <b-row>
            <b-col>
                <b-input-group prepend="Colormap" style="flex-wrap: nowrap">
                    <ColorScalePicker v-model="abs_colorscale" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-form-checkbox switch v-model="show_relative_diff"
                    >Show Relative Differences</b-form-checkbox
                >
            </b-col>
        </b-row>
        <b-row v-show="show_relative_diff">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group prepend="Relative To Group">
                    <b-form-select
                        v-model="relative_diff_group"
                        :options="relative_diff_group_options"
                    ></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row v-show="show_relative_diff">
            <b-col cols="1"></b-col>
            <b-col>
                <b-input-group
                    prepend="Relative Colormap"
                    style="flex-wrap: nowrap"
                >
                    <ColorScalePicker v-model="rel_colorscale" />
                </b-input-group>
            </b-col>
        </b-row>
    </b-container>
</template>

<script scoped lang="ts">
import Vue from "vue";
import mixins from "vue-typed-mixins";
import WindowMixin from "../../../components/Core/Window/WindowMixin";

export default mixins(WindowMixin).extend({
    mounted() {
        this.populateGroups();
    },
    methods: {
        populateGroups() {
            this.relative_diff_group_options = this.selectedGroups.map((g) => ({
                text: g,
                value: g,
            }));
            if (this.relative_diff_group === undefined) {
                this.relative_diff_group =
                    this.relative_diff_group_options[0].value;
            }
        },
    },
    computed: {
        selectedGroups(): string[] {
            return this.dataview.selectedGroups;
        },
        abs_colorscale: {
            get(): string {
                return this.settings.abs_colormap;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
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
                this.$store.commit(`${this.id}/updateComponentSettings`, {
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
    },
    data() {
        return {
            relative_diff_group_options: new Array<{
                text: string;
                value: string;
            }>(),
        };
    },
});
</script>

<style scoped>
.row {
    margin: 10px 0;
}
</style>
