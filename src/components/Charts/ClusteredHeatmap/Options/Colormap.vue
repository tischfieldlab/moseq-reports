<template>
    <b-container fluid>
        <b-row>
            <b-col>
                <b-input-group prepend="Colormap">
                    <ColorScalePicker v-model="colormap" />
                </b-input-group>
            </b-col>
        </b-row>
    </b-container>
</template>


<script lang="ts">
import Vue from 'vue'
import mixins from 'vue-typed-mixins';
import ColorScalePicker from '@/components/Charts/Colors/ColorScalePicker.vue';
import WindowMixin from '@/components/Core/WindowMixin';



export default mixins(WindowMixin).extend({
    components: {
        ColorScalePicker,
    },
    computed: {
        colormap: {
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
});
</script>