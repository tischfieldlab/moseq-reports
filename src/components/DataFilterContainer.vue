<template>
    <div class="filter_container" :style="{width: `${width}px`}">
        <h3>Data Filters</h3>
        <div>
            <template v-for="ns in filters">
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
    props: {
        width: {
            type: Number,
            default: 250,
        },
    },
    computed: {
        filters(): string[] {
            return this.$store.state.filters.items;
        },
    },
    created() {
        if (this.filters.length === 0) {
            this.$store.dispatch('filters/addFilter');
        }
    },
});
</script>

<style scoped>
.filter_container {
    display: flex;
    flex-flow: column;
    height: 100%;
}
.filter_container > h3 {
    background: #c5c5c5;
    padding: 10px;
    margin-bottom: 0;
    font-size: 1.5em;
}
.filter_container > div {
    flex-grow : 1;
    overflow-y: auto;
    overflow-x: hidden;
}
</style>