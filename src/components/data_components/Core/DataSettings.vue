<template>
    <b-container>
        <b-row>
            <b-col cols="10">
                <b-input-group prepend="Data Source">
                    <b-form-select v-model="datasource" :options="available_sources" />
                </b-input-group>
            </b-col>
            <b-col cols="1">
                <b-button @click="add_datasource">add</b-button>
            </b-col>
        </b-row>
    </b-container>
</template>


<script lang="ts">
import Vue from 'vue';
import { unnest } from '@/util/Vuex';
import mixins from 'vue-typed-mixins';
import WindowOptionsMixin from './WindowOptionsMixin';

export default mixins(WindowOptionsMixin).extend({
    computed: {
        available_sources(): string[] {
            return this.$store.state.filters.items;
        },
        datasource: {
            get(): string {
                return unnest(this.$store.state, this.id).datasource;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentDataSource`, {
                    source: value,
                    id: this.id,
                });
            },
        },
    },
    methods: {
        add_datasource() {
            this.$store.dispatch('filters/addFilter');
        },
    },
});
</script>


<style scoped>
.row{
    margin:10px 0;
}
</style>