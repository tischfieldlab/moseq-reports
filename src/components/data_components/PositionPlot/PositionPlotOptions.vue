<template>
    <b-container fluid>
        <b-row>
            <b-col>
                <b-input-group prepend="Display Mode">
                    <b-form-select v-model="mode" :options="mode_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Colormap" style="flex-wrap:nowrap">
                    <ColorScalePicker v-model="colorscale" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-input-group prepend="Resolution">
                    <b-form-input type="number" v-model="resolution" min="1" max="10" ></b-form-input>
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


export enum PositionPlotMode {
    Overall = 'Overall',
    Grouped = 'Grouped',
}


export default mixins(WindowMixin).extend({
    components: {
        ColorScalePicker,
    },
    computed: {
        // returns current mode of position plot. If changed, value will be updated in component through `updateComponentSettings` mutation in store.
        mode: {
            get(): string {
                return this.settings.mode;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        mode: value,
                    },
                });
            },
        },
        // returns resolution of Position Plot. If changed, value will be updated in component through `updateComponentSettings` mutation in store.
        resolution: {
            get(): number {
                return this.settings.resolution;
            },
            set(value: number) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        resolution: value,
                    },
                });
            },
        },
        // returns color scheme of current Position plot. If changed, value will be updated in component through #UpdateComponentSettings.
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
    },
    data() {
        return {
            mode_options: [
                { text: 'Overall', value: PositionPlotMode.Overall },
                { text: 'Grouped', value: PositionPlotMode.Grouped },
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