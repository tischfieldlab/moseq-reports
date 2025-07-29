<template>
    <BInputGroup size="sm">
        <BInputGroupText>
            Columns
        </BInputGroupText>
        <ColumnSelector v-model="localSelectedColumns" :options="columnOptions" :disabled="isAutoMapping" />
        <BInputGroupText is-text title="Automatic mapping" v-b-tooltip.hover>
            <BFormCheckbox switch v-model="isAutoMapping" />
        </BInputGroupText>
    </BInputGroup>
</template>

<script setup lang="ts">
import { ref, watch, computed, toRef } from 'vue';
import ColumnSelector from './ColumnSelector.vue';

const operation = defineModel<{columns: string[] | undefined }>({required: true});

const props = defineProps<{
    previousResult: any;
    owner: string;
}>();



const isAutoMapping = ref(true);//computed(() => operation.value.columns !== undefined);
const localSelectedColumns = ref(operation.value.columns !== undefined ? [...operation.value.columns] : []);

watch(isAutoMapping, (enabled) => {
    operation.value.columns = enabled ? undefined : localSelectedColumns.value;
});

watch(localSelectedColumns, (cols) => {
    if (!isAutoMapping.value) {
        operation.value.columns = cols;
    }
});

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
</script>