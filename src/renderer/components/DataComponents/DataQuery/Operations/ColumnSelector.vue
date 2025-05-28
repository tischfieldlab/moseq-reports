<template>
    <BFormGroup :label="label" :label-for="formId" class="container-form-group">
        <BFormTags :id="formId" v-model="modelValue" :disabled="disabled" no-outer-focus class="mb-2">
            <template #default="{ tags, disabled, addTag, removeTag }">
                <BDropdown size="sm" variant="outline-secondary" block menu-class="w-100" :disabled="disabled">
                    <template #button-content>
                        <slot name="icon">
                            <IBiLayoutThreeColumns />
                        </slot>
                    </template>

                    <BDropdownForm @submit.stop.prevent>
                        <BInputGroup size="sm" class="mb-2" :disabled="disabled">
                            <BInputGroupText is-text>
                                <IBiSearch />
                            </BInputGroupText>
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
import { ref, computed, watch } from 'vue';
import IBiLayoutThreeColumns from '~icons/bi/layout-three-columns';

const modelValue = defineModel<string[]>({required: true});

interface ColumnSelectorProps {
    options: string[];
    label?: string;
    disabled?: boolean;
    noun?: string;
}

const props = withDefaults(defineProps<ColumnSelectorProps>(), {
    label: '',
    disabled: false,
    noun: 'Column',
});


const search = ref('');
const formId = `tags-${Math.random().toString(36).substring(2, 10)}`;



// Search-related computed
const criteria = computed(() => search.value.trim().toLowerCase());

const availableOptions = computed(() => {
    const filtered = props.options.filter((opt) => !modelValue.value.includes(opt));
    return criteria.value
        ? filtered.filter((opt) => opt.toLowerCase().includes(criteria.value))
        : filtered;
});


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

.b-form-tags {
    margin-bottom: 0 !important;
    border-radius: 0;
}

.b-dropdown {
    display: inline-block;
    margin-right: 0.5rem;
}

.dropdown-item-text {
    padding: 0.25rem 0.5rem;
}

.dropdown-item-text>.input-group-text {
    margin-bottom: 0 !important;
}
</style>