<template>
  <div>
    <BInputGroup prepend="Group By" size="sm">
      <ColumnSelector v-model="operation.groupby" :options="columnOptions" />
    </BInputGroup>

    <BDropdown text="Add Aggregation" class="add-agg-button mx-auto" size="sm">
      <template v-for="col in columnOptions" :key="col">
        <BDropdownItem
          v-if="!columnAlreadyIncluded(col)"
          @click="addAggregate(col)"
        >
          {{ col }}
        </BDropdownItem>
      </template>
    </BDropdown>

    <template v-for="(value, key) in localAggs" :key="key">
      <BInputGroup :prepend="key" size="sm">
        <ColumnSelector
          v-model="localAggs[key]"
          icon="calculator"
          noun="Statistic"
          :options="statOptions"
        />
        <BInputGroup-append is-text>
          <BButton @click="removeAggregate(key)"  class="btn-close ms-auto" aria-label="Close" />
        </BInputGroup-append>
      </BInputGroup>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue';
import ColumnSelector from './ColumnSelector.vue';
import type { AggregateOperation } from '@render/components/Core/DataTypes';
const props = defineProps<{
  operation: {
    groupby: string[];
    aggregate: AggregateOperation;
  };
  previousResult: any;
  owner: string;
}>();

const localAggs = reactive(props.operation.aggregate || {});

watch(
  () => localAggs,
  () => {
    props.operation.aggregate = localAggs;
  },
  { deep: true }
);

const columnOptions = computed(() => {
  const obj = props.previousResult;
  if (!obj) return [];
  if (Array.isArray(obj) && obj.length > 0) return Object.keys(obj[0]);
  if (typeof obj === 'object') return Object.keys(obj);
  return [];
});

const statOptions = [
  'mean',
  'median',
  'sum',
  'min',
  'max',
  'extent',
  'variance',
  'deviation',
  'count',
];

function addAggregate(colName: string) {
  localAggs[colName] = [];
}

function removeAggregate(colName: string) {
  delete localAggs[colName];
}

function columnAlreadyIncluded(colName: string) {
  return Object.prototype.hasOwnProperty.call(localAggs, colName);
}
</script>

<style scoped>
.add-agg-button {
  margin: 0.25rem 0;
}
</style>
