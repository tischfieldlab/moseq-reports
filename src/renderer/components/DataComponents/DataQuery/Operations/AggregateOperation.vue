<template>
    <div>
        <BInputGroup prepend="Group By" size="sm">
            <ColumnSelector v-model="modelValue.groupby" :options="columnOptions" />
        </BInputGroup>

        <BDropdown text="Add Aggregation" class="add-agg-button mx-auto" size="sm">
            <template v-for="col in columnOptions" :key="col">
                <BDropdownItem v-if="!columnAlreadyInAggregation(col)" @click="addAggregate(col)">
                    {{ col }}
                </BDropdownItem>
            </template>
        </BDropdown>

        <template v-for="(value, key) in localAggs" :key="key">
            <BInputGroup :prepend="key" size="sm">
                <ColumnSelector v-model="(localAggs[key] as string[])" :icon="BiCalculator" noun="Statistic" :options="statOptions">
                    <template #icon>
                        <BiCalculator />
                    </template>
                </ColumnSelector>
                <BInputGroupText is-text>
                    <BButton @click="removeAggregate(key as string)" class="btn-close ms-auto" aria-label="Close" />
                </BInputGroupText>
            </BInputGroup>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import ColumnSelector from './ColumnSelector.vue';
import type { AggregateOperation, Statistic } from '@api';
import BiCalculator from '~icons/bi/calculator'

const props = defineProps<{
    previousResult: any;
    owner: string;
}>();

const modelValue = defineModel<AggregateOperation>({required: true});

const localAggs = ref(modelValue.value.aggregate !== undefined ? {...modelValue.value.aggregate} : {});
watch(localAggs,
    () => { modelValue.value.aggregate = localAggs.value; },
    { deep: true }
);

const columnOptions = computed((): string[] => {
    const obj = props.previousResult;
    if (!obj)
        return [];

    if (Array.isArray(obj) && obj.length > 0)
        return Object.keys(obj[0]) as string[];

    if (typeof obj === 'object')
        return Object.keys(obj);

    return [];
});

const statOptions: Statistic[] = [
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
    localAggs.value[colName] = [];
}

function removeAggregate(colName: string) {
    delete localAggs.value[colName];
}

function columnAlreadyInAggregation(colName: string) {
    return Object.prototype.hasOwnProperty.call(localAggs.value, colName);
}
</script>

<style scoped>
.add-agg-button {
    margin: 0.25rem 0;
}
</style>
