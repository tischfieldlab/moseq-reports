<template>
    <div>
        <BButton class="float-end add-sorting-button" size="sm" @click="addSorting">
            Add Sorting
        </BButton>

        <template v-for="(column, idx) in operation.columns" :key="idx">
            <BInputGroup size="sm" class="mb-2">
                <BInputGroupText>
                    Column
                </BInputGroupText>
                <BFormSelect v-model="column[0]" :options="columnOptions" />
                <BFormSelect v-model="column[1]" :options="directionOptions" />
                <BInputGroupText>
                    <BButton @click="removeSorting(idx)" title="Remove this sorting" class="btn-close ms-auto" aria-label="Close" v-b-tooltip.hover />
                </BInputGroupText>
            </BInputGroup>
        </template>
    </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';
import { SortOperation, SortDirection } from '@api';

const operation = defineModel<SortOperation>({required: true});


const props = defineProps<{
    previousResult: any;
    owner: string;
}>();


const directionOptions = [
    { text: 'Ascending', value: SortDirection.Asc },
    { text: 'Descending', value: SortDirection.Desc },
];

const columnOptions = computed(() => {
    const data = props.previousResult;
    if (!data) return [];

    if (Array.isArray(data)) {
        return data.length > 0 ? Object.keys(data[0]) : [];
    }

    if (data.columns && data.data) return data.columns;

    return [];
});

function addSorting() {
    operation.value.columns.push(['', 'asc']);
}

function removeSorting(idx: number) {
    operation.value.columns.splice(idx, 1);
}
</script>

<style scoped>
.add-sorting-button {
    margin-top: -3rem;
    margin-right: 50px;
}
</style>