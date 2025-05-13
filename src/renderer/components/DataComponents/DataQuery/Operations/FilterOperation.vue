<template>
  <div>
    <BDropdown text="Add Filter" class="float-right add-filter-button" size="sm">
      <BDropdownItem
        v-for="col in columnOptions"
        :key="col"
        v-if="!columnAlreadyInFilter(col)"
        @click="addFilter(col)"
      >
        {{ col }}
      </BDropdownItem>
    </BDropdown>

    <template v-for="(values, key, i) in localFilters" :key="`${key}-${i}`">
      <BInputGroup size="sm">
        <BInputGroup-prepend
          is-text
          :title="`${inferDataTypeForColumn(String(key))} datatype`"
          v-b-tooltip.hover
        >
          {{ String(key) }}
        </BInputGroup-prepend>

        <BFormTags
          v-model="localFilters[String(key)]"
          placeholder="Add value..."
          duplicate-tag-text="Duplicate value(s)"
          invalid-tag-text="Invalid value(s)"
          tag-remove-label="Remove value"
        />

        <BInputGroup-append is-text>
          <BButton
            @click="removeFilter(String(key))"
            title="Remove this filter"
            class="btn-close ms-auto"
            aria-label="Close"
            v-b-tooltip.hover
          />
        </BInputGroup-append>
      </BInputGroup>
    </template>

    <div class="special-token-container">
      Special Tokens:
      <b-tag
        v-for="(value, key) in specialTokens"
        :key="key"
        class="special-token"
        no-remove
        pill
        variant="info"
      >
        <span :title="JSON.stringify(value)" v-b-tooltip.hover>{{ key }}</span>
      </b-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef , computed, watch } from 'vue';
import type { FilterOperation } from '@render/components/Core/DataTypes';

const props = defineProps<{
  operation: FilterOperation;
  previousResult: any;
  owner: string;
  specialTokens: Record<string, any>;
}>();

const localFilters = toRef(props.operation, 'filters');

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

function addFilter(colName: string) {
  localFilters[colName] = [];
}

function removeFilter(colName: string) {
  delete localFilters[colName];
}

function columnAlreadyInFilter(colName: string): boolean {
  return Object.prototype.hasOwnProperty.call(localFilters, colName);
}

function inferDataTypeForColumn(colName: string): string {
  const obj = props.previousResult;
  if (Array.isArray(obj) && obj.length > 0) {
    const value = obj[0][colName];
    if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float';
    return typeof value;
  }
  return 'undefined';
}
</script>

<style scoped>
.add-filter-button {
  margin-top: -3rem;
  margin-right: 50px;
}
.data-type {
  padding-left: 6px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
}
.special-token-container {
  margin-top: 0.5rem;
  color: #666;
}
</style>
