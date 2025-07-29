<template>
    <BCard>
        <template #header>
            <span>Filter Syllable ID</span>
            <BButton
                variant="link"
                v-if="tags.length > 0"
                class="clear-all-tags"
                @click="clearAllTags"
                title="Clear all syllable filters">

                <i class="bi-x-circle"></i>
            </BButton>
        </template>
        <BFormTags
            id="filter-module-id"
            v-model="tags"
            class="mb-2"
            separator=" ,;"
            placeholder="Add ID(s)..."
            :tag-validator="tagValidator" />
    </BCard>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import parsePart from "parse-numeric-range";
import { useDataViewStore } from "@store/dataview.store";


export default defineComponent({
    name: "SyllableIdFilter",
    props: {
        datasource: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const dataviewStore = useDataViewStore(props.datasource);

        const tags = ref<string[]>([]);

        const tagsAsIds = computed((): number[] => {
            return parsePart(tags.value.join(","));
        });

        function clearAllTags() {
            tags.value = []; // Clear all tags
        }
        function tagValidator(tag: string) {
            const ids = parsePart(tag) as number[];
            if (!ids || ids.length === 0) {
                return false; // Invalid if the tag cannot be parsed into IDs
            }
            // Check if every ID is in the available syllable options
            return ids.every((id) => dataviewStore.availableModuleIds.includes(id));
        }

        watch(tagsAsIds, (newIds: number[], oldIds: number[]) => {
            if (JSON.stringify(newIds) !== JSON.stringify(oldIds)) {
                dataviewStore.updateModuleIdFilters(newIds); // Update the filter in the store
            }
        }, {
            deep: true,
        });

        return {
            tags,
            tagsAsIds,
            clearAllTags,
            tagValidator,
        };
    },
});
</script>

<style scoped>
.clear-all-tags {
    float: right;
    padding: 0;
}
:deep(.card-body) {
    padding: 0;
}

:deep(.b-form-tags) {
    margin-bottom: 0 !important;
    border: 0;
}
</style>
