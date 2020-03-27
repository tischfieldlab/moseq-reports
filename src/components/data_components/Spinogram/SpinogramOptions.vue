<template>
    <b-container fluid>
        <b-row>
            <b-col cols="4" align-self="center">
                <label class="font-weight-bold pt-0">Line Weight</label>
            </b-col>
            <b-col>
                <b-form-input v-model="line_weight" type="number" number="true" min="1" max="10" />
            </b-col>
        </b-row>
        <b-row>
            <b-col cols="4" align-self="center">
                <label class="font-weight-bold pt-0">Line Color</label>
            </b-col>
            <b-col>
                <chrome-picker v-model="line_color" disableAlpha="true" />
            </b-col>
        </b-row>
    </b-container>
</template>

<script scoped lang="ts">
import Vue from 'vue';
import { Chrome } from 'vue-color';
import mixins from 'vue-typed-mixins';
import WindowOptionsMixin from '@/components/Core/WindowOptionsMixin';

export default mixins(WindowOptionsMixin).extend({
    components: {
        'chrome-picker': Chrome,
    },
    computed: {
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
