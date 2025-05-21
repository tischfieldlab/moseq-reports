<template>
    <BInputGroup prepend="Column" size="sm">
        <BFormSelect v-model="operation.column" :options="columnOptions" />
    </BInputGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PluckOperation } from '@api';

const operation = defineModel<PluckOperation>({required: true});

const props = defineProps<{
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