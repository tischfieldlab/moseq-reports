<template>
    <div>
      <BButton class="float-right add-sorting-button" size="sm" @click="addSorting">
        Add Sorting
      </BButton>
  
      <template v-for="(column, idx) in operation.columns" :key="idx">
        <BInputGroup size="sm" class="mb-2">
          <template #prepend>Column</template>
          <BSelect v-model="column[0]" :options="columnOptions" />
          <BSelect v-model="column[1]" :options="directionOptions" />
          <template #append>
            <BButtonClose @click="removeSorting(idx)" title="Remove this sorting" v-b-tooltip.hover />
          </template>
        </BInputGroup>
      </template>
    </div>
  </template>
  
  <script setup lang="ts">
  import { PropType, computed } from 'vue';
  import { SortOperation, SortDirection } from '@render/components/Core/DataTypes';
  
  const props = defineProps<{
    Operation: SortOperation;
    PreviousResult: any;
    Owner: string;
  }>();
  
  const operation = props.Operation;
  
  const directionOptions = [
    { text: 'Ascending', value: SortDirection.Asc },
    { text: 'Descending', value: SortDirection.Desc },
  ];
  
  const columnOptions = computed(() => {
    const data = props.PreviousResult;
    if (!data) return [];
  
    if (Array.isArray(data)) {
      return data.length > 0 ? Object.keys(data[0]) : [];
    }
  
    if (data.columns && data.data) return data.columns;
  
    return [];
  });
  
  function addSorting() {
    operation.columns.push(['', 'asc']);
  }
  
  function removeSorting(idx: number) {
    operation.columns.splice(idx, 1);
  }
  </script>
  
  <style scoped>
  .add-sorting-button {
    margin-top: -3rem;
    margin-right: 50px;
  }
  </style>
  