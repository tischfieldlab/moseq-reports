<template>
    <div>
        <BDropdown text="Add Filter" class="float-end add-filter-button" size="sm">
            <template v-for="col in columnOptions" :key="col">
                <BDropdownItem v-if="!columnAlreadyInFilter(col)"
                    @click="addFilter(col)">
                    {{ col }}
                </BDropdownItem>
            </template>
        </BDropdown>

        <template v-for="(values, key, i) in operation.filters" :key="`${key}-${i}`">
            <BInputGroup size="sm">
                <BInputGroupText is-text :title="`${inferDataTypeForColumn(key as string)} datatype`"
                    v-b-tooltip.hover>
                    {{ key }}
                </BInputGroupText>

                <BFormTags v-model="operation.filters[key]" placeholder="Add value..."
                    duplicate-tag-text="Duplicate value(s)" invalid-tag-text="Invalid value(s)"
                    tag-remove-label="Remove value" />

                <BInputGroupText is-text>
                    <BButton @click="removeFilter(key as string)" title="Remove this filter" class="btn-close ms-auto"
                        aria-label="Close" v-b-tooltip.hover />
                </BInputGroupText>
            </BInputGroup>
        </template>

        <div class="special-token-container">
            Special Tokens:<br />
            <BFormTag v-for="(value, key) in specialTokens" :key="key" class="special-token" no-remove pill variant="info" size="sm">
                <span :title="JSON.stringify(value)" v-b-tooltip.hover>{{ key }}</span>
            </BFormTag>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { FilterOperation } from '@api';

const operation = defineModel<FilterOperation>({required: true});

const props = defineProps<{
    previousResult: any;
    owner: string;
    specialTokens: Record<string, any>;
}>();


const columnOptions = computed((): string[] => {
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
    operation.value.filters[colName] = [];
}

function removeFilter(colName: string) {
    delete operation.value.filters[colName];
}

function columnAlreadyInFilter(colName: string): boolean {
    return Object.prototype.hasOwnProperty.call(operation.value.filters, colName);
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
    margin-top: -55px;
    margin-right: 50px;
}

.data-type {
    padding-left: 6px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 11px;
}

.special-token-container {
    font-size:  small;
    margin-top: 0.5rem;
    color: #666;
}
</style>
