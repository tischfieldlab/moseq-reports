<template>
    <div>
        <div class="action_container text-right">
            <b-button @click="add_datasource" pill size="sm">
                <b-icon icon="plus"></b-icon>
                <b-spinner v-show="is_adding_source" small type="grow"></b-spinner>
                <span v-show="!is_adding_source">
                    Add
                </span>
            </b-button>
        </div>
        <div class="filters_container">
            <template v-for="ns in this.$store.state.filters.items">
                <DataFilter :key="ns" :datasource="ns" />
            </template>
        </div>
    </div>
</template>


<script lang="ts">
import Vue from 'vue';
import DataFilter from '@/components/DataFilter.vue';

export default Vue.extend({
    components: {
        DataFilter,
    },
    data() {
        return {
            is_adding_source: false,
        };
    },
    computed: {
        filters(): string[] {
            return this.$store.state.filters.items;
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
.action_container {
    padding: 12px;
}
.filters_container {
    padding-right: 12px
}
</style>