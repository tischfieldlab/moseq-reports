<template>
    <div>
        <div class="action_container">
            <BButton @click="addDatasource" block size="sm" variant="primary">
                <BSpinner v-if="isAddingSource" small type="grow"></BSpinner>
                <i class="bi bi-plus"></i>
            </BButton>
        </div>
        <h3>Data Filters</h3>

        <div class="filters_container">
            <template v-for="ns in filters" :key="ns">
                <DataFilter :datasource="ns" />
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import DataFilter from "@render/components/DataFilter.vue";
import { nextTick } from "vue";
import { useFiltersStore } from "@store/filters.store";

export default defineComponent({
    name: "DataFilterContainer",
    components: {
        DataFilter,
    },
    setup() {
        const filtersStore = useFiltersStore(); 

        const isAddingSource = ref(false);
        const addDatasource = async () => {
            isAddingSource.value = true;
            await nextTick(); 
            try {
                await filtersStore.addFilter();
            } finally {
                isAddingSource.value = false;
            }
        };

        return {
            isAddingSource,
            filters: filtersStore.items,
            addDatasource,
        };
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
    padding: 0 6px 0 0;
}
</style>
