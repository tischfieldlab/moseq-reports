<template>
    <b-container>
        <b-row>
            <b-col cols="10">
                <b-input-group prepend="Data Source">
                    <b-form-select v-model="data_source" :options="available_sources" />
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

export default Vue.component('data-settings', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    computed: {
        available_sources(): string[] {
            return this.$store.state.filters.items;
        },
        data_source: {
            get(): string {
                return this.$store.getters.getWindowById(this.id).source.name;
            },
            set(value: string) {
                this.$store.commit('updateComponentDataSource', {
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