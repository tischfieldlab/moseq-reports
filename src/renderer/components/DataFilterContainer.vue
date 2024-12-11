<template>
  <div>
    <div class="action_container">
      <b-button @click="addDatasource" block size="sm" variant="primary">
        <b-spinner v-if="isAddingSource" small type="grow"></b-spinner>
        <i class="bi bi-plus"></i>
        
      </b-button>
    </div>
    <h3>Data Filters</h3>

    <div class="filters_container">
      <!-- Place the key attribute on the <template> tag -->
      <template v-for="ns in filters" :key="ns">
        <DataFilter :datasource="ns" />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex"; // Ensure Vuex 4 is installed
import DataFilter from "@render/components/DataFilter.vue";
import { nextTick } from "vue";

export default defineComponent({
  name: "DataFilterContainer",
  components: {
    DataFilter,
  },
  setup() {
    const store = useStore(); // Access Vuex store

    const isAddingSource = ref(false);

    const filters = computed(() => store.state.filters.items); // Reactive state

    const addDatasource = async () => {
      isAddingSource.value = true;
      await nextTick(); // Ensure DOM updates before dispatching action
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
