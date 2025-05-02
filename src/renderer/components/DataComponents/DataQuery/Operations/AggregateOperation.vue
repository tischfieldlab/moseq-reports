<template>
  <div>
    <b-input-group prepend="Group By" size="sm">
      <ColumnSelector v-model="operation.groupby" :options="columnOptions" />
    </b-input-group>

    <b-dropdown text="Add Aggregation" class="add-agg-button mx-auto" size="sm">
      <template v-for="col in columnOptions" :key="col">
        <b-dropdown-item
          v-if="!columnAlreadyIncluded(col)"
          @click="addAggregate(col)"
        >
          {{ col }}
        </b-dropdown-item>
      </template>
    </b-dropdown>

    <template v-for="(value, key) in localAggs" :key="key">
      <b-input-group :prepend="key" size="sm">
        <ColumnSelector
          v-model="localAggs[key]"
          icon="calculator"
          noun="Statistic"
          :options="statOptions"
        />
        <b-input-group-append is-text>
          <b-button-close @click="removeAggregate(key)" />
        </b-input-group-append>
      </b-input-group>
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
