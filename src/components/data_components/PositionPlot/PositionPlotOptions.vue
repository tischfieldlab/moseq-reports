<template>
    <b-container fluid>
        <b-row>
            <b-col>
                <b-input-group prepend="Colormap">
                    <b-form-select v-model="colorscale" :options="color_options"></b-form-select>
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
import WindowMixin from '@/components/Core/WindowMixin';
import { GetInterpolatedScaleOptions } from '@/components/Charts/D3ColorProvider';


export default mixins(WindowMixin).extend({
    computed: {
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
            color_options: GetInterpolatedScaleOptions(),
        };
    },
});
</script>

<style lang="scss" scoped>
.row {
    margin:10px 0;
}
</style>