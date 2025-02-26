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
import { useStore } from "vuex"; 
import DataFilter from "@render/components/DataFilter.vue";
import { nextTick } from "vue";

export default defineComponent({
  name: "DataFilterContainer",
  components: {
    DataFilter,
  },
  setup() {
    const store = useStore(); 

    const isAddingSource = ref(false);

    const filters = computed(() => store.state.filters.items); 

    const addDatasource = async () => {
      isAddingSource.value = true;
      await nextTick(); 
      try {
        await store.dispatch("filters/addFilter");
      } finally {
        isAddingSource.value = false;
      }
    };

    return {
      isAddingSource,
      filters,
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
}
</style>
