<template>
    <b-container fluid>
        <b-row>
            <b-input-group prepend="Line Weight">
                <b-form-input v-model="line_weight" type="number" :number="true" min="1" max="10" />
            </b-input-group>
        </b-row>
        <b-row>
            <b-input-group prepend="Line Color">
                <chrome-picker v-model="line_color" :disableAlpha="true" />
            </b-input-group>
        </b-row>
    </b-container>
</template>

<script scoped lang="ts">
import Vue from 'vue';
import { Chrome } from 'vue-color';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/Window/WindowMixin';

export default mixins(WindowMixin).extend({
    components: {
        'chrome-picker': Chrome,
    },
    computed: {
        //Changes line color of graph. Can be updated when changed through the `updateDataComponent` function.
        line_color: {
            get(): string {
                return this.settings.line_color;
            },
            set(value: any) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        line_color: value.hex,
                    },
                });
            },
        },
        //Changes current thickness of the line. When changed, value is updated through the `updateDatacomponent` in the store.
        line_weight: {
            get(): string {
                return this.settings.line_weight;
            },
            set(value: any) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        line_weight: value,
                    },
                });
            },
        },
    },
});
</script>

<style lang="scss" scoped>
.row{
    margin:10px 0;
}
</style>
