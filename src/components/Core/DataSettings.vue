<template>
    <b-container>
        <b-row>
            <b-col cols="10">
                <b-input-group prepend="Data Source">
                    <b-form-select v-model="datasource" :options="available_sources" />
                </b-input-group>
            </b-col>
            <b-col cols="1">
                <b-button @click="add_datasource">
                    <b-spinner v-show="is_adding_source" small type="grow"></b-spinner>
                    <span v-show="!is_adding_source">
                        add
                    </span>
                </b-button>
            </b-col>
        </b-row>
    </b-container>
</template>


<script lang="ts">
import Vue from 'vue';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';

export default mixins(WindowMixin).extend({
    data() {
        return {
            is_adding_source: false,
        };
    },
    computed: {
        available_sources(): string[] {
            return this.$store.state.filters.items;
        },
        datasource: {
            get(): string {
                return this.$wstate.datasource;
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
            this.is_adding_source = true;
            this.$forceNextTick(() => {
                this.$store.dispatch('filters/addFilter')
                    .finally(() => this.is_adding_source = false);
            });
        },
    },
});
</script>


<style scoped>
.row{
    margin:10px 0;
}
</style>