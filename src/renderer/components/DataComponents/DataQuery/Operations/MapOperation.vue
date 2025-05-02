<template>
    <b-input-group prepend="Columns" size="sm">
      <ColumnSelector
        v-model="localSelectedColumns"
        :options="columnOptions"
        :disabled="!isColumnsEnabled"
      />
      <b-input-group-append is-text title="Automatic mapping" v-b-tooltip.hover>
        <b-form-checkbox switch v-model="isColumnsEnabled" />
      </b-input-group-append>
    </b-input-group>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, computed, toRef } from 'vue';
  import type { MapOperation } from '@render/components/Core/DataTypes';
  import ColumnSelector from './ColumnSelector.vue';
  
  const props = defineProps<{
    operation: MapOperation;
    previousResult: any;
    owner: string;
  }>();
  
  const isColumnsEnabled = ref(props.operation.columns !== undefined);
  const localSelectedColumns = toRef(props.operation, 'columns');
  
  watch(isColumnsEnabled, (enabled) => {
    props.operation.columns = enabled ? localSelectedColumns.value : undefined;
  });
  
  watch(localSelectedColumns, (cols) => {
    if (isColumnsEnabled.value) {
      props.operation.columns = cols;
    }
  });
  
  const columnOptions = computed(() => {
    const obj = props.previousResult;
    if (!obj) return [];
    if (Array.isArray(obj)) {
      return obj.length > 0 ? Object.keys(obj[0]) : [];
    }
    if (obj.columns && obj.data) {
      return obj.columns;
    }
    return [];
  });
  </script>
  