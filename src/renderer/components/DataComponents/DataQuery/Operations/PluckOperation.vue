<template>
    <b-input-group prepend="Column" size="sm">
      <b-select v-model="operation.column" :options="columnOptions" />
    </b-input-group>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import type { PluckOperation } from '@render/components/Core/DataTypes';
  
  const props = defineProps<{
    operation: PluckOperation;
    previousResult: any;
    owner: string;
  }>();
  
  const columnOptions = computed(() => {
    const obj = props.previousResult;
    if (!obj) return [];
    if (Array.isArray(obj)) {
      return obj.length > 0 ? Object.keys(obj[0]) : [];
    }
    return Object.keys(obj);
  });
  </script>
  