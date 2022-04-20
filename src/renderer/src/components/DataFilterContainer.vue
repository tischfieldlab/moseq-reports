<template>
    <div>
        <div class="action_container">
            <b-button @click="add_datasource" block size="sm" variant="primary">
                <b-spinner
                    v-if="is_adding_source"
                    small
                    type="grow"
                ></b-spinner>
                <b-icon v-else icon="plus"></b-icon>
            </b-button>
        </div>
        <h3>Data Filters</h3>

        <div class="filters_container">
            <template v-for="ns in this.$store.state.filters.items">
                <DataFilter :key="ns" :datasource="ns" />
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import DataFilter from "../components/DataFilter.vue";

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
                this.$store
                    .dispatch("filters/addFilter")
                    .finally(() => (this.is_adding_source = false));
            });
        },
    },
});
</script>

<style scoped>
.action_container {
    padding: 0 12px;
    float: right;
}
h3 {
    text-align: center;
    margin-top: 12px;
}
.filters_container {
    clear: both;
}
</style>
