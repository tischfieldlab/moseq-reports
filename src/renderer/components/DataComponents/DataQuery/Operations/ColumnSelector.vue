<template>
    <BFormGroup :label="label" :label-for="formId" class="container-form-group">
        <BFormTags :id="formId" v-model="localValue" :disabled="disabled" no-outer-focus class="mb-2">
            <template #default="{ tags, disabled, addTag, removeTag }">
                <BDropdown size="sm" variant="outline-secondary" block menu-class="w-100" :disabled="disabled">
                    <template #button-content>
                        <b-icon :icon="icon" />
                    </template>

                    <BDropdownForm @submit.stop.prevent>
                        <BInputGroup size="sm" class="mb-2" :disabled="disabled">
                            <BInputGroup-prepend is-text>
                                <b-icon icon="search" />
                            </BInputGroup-prepend>
                            <BFormInput v-model="search" id="tag-search-input" type="search" size="sm"
                                autocomplete="off" placeholder="Search" />
                        </BInputGroup>
                    </BDropdownForm>

                    <BDropdownForm />

                    <BDropdownItemButton v-for="option in availableOptions" :key="option"
                        @click="onOptionClick(option, addTag)">
                        {{ option }}
                    </BDropdownItemButton>

                    <BDropdownText v-if="availableOptions.length === 0">
                        There are no {{ noun }}s available to select
                    </BDropdownText>
                </BDropdown>

                <ul v-if="tags.length > 0" class="list-inline d-inline-block mb-2" style="display: inline !important;">
                    <li v-for="tag in tags" :key="tag" class="list-inline-item">
                        <BFormTag @remove="removeTag(tag)" :title="tag" :disabled="disabled" variant="info">
                            {{ tag }}
                        </BFormTag>
                    </li>
                </ul>
            </template>
        </BFormTags>
    </BFormGroup>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from 'vue';

const props = defineProps<{
    modelValue: string[];
    options: string[];
    label?: string;
    disabled?: boolean;
    icon?: string;
    noun?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const search = ref('');
const localValue = ref<string[]>(props.modelValue || []);
const formId = `tags-${Math.random().toString(36).substring(2, 10)}`;

// Sync local changes back to parent
watch(localValue, (val) => {
    emit('update:modelValue', val);
});

// Search-related computed
const criteria = computed(() => search.value.trim().toLowerCase());

const availableOptions = computed(() => {
    const filtered = props.options.filter((opt) => !localValue.value.includes(opt));
    return criteria.value
        ? filtered.filter((opt) => opt.toLowerCase().includes(criteria.value))
        : filtered;
});

// Default props
const icon = props.icon || 'layout-three-columns';
const noun = props.noun || 'Column';

// Tag selection handler
function onOptionClick(option: string, addTag: (t: string) => void) {
    addTag(option);
    search.value = '';
}
</script>

<style scoped>
.container-form-group {
    margin-bottom: 0;
    flex: 1 1 auto;
    min-width: 0;
    width: 1%;
}

.BFormTags {
    margin-bottom: 0 !important;
    border-radius: 0;
}

.BDropdown {
    display: inline-block;
    margin-right: 0.5rem;
}

.BDropdownForm {
    padding: 0.25rem 0.5rem;
}

.BDropdownForm>.input-group {
    margin-bottom: 0 !important;
}
</style>