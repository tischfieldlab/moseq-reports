<template>
    <div class="filter-module-id mb-2">
        <label for="filter-module-id" class="d-flex justify-content-between align-items-center">
            <span>Filter Module ID</span>
            <button
                v-if="tags.length > 0"
                class="btn btn-link p-0 text"
                @click="clearAllTags"
                title="Clear all IDs">

                <i class="bi-x-circle-fill"></i>
            </button>
        </label>
        <BFormTags
            id="filter-module-id"
            v-model="tags"
            class="mb-2"
            separator=" ,;"
            placeholder="Add ID(s)..."
            :tag-validator="tagValidator" />
    </div>
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
            tags.value.splice(0, tags.value.length); // Clear all tags
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
            console.log("Syllable ID filter changed:", newIds, oldIds);
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
.filter-module-id {
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 4px;
}
.filter-module-id label {
    display: block;
    margin-bottom: 0.25rem;
}
.filter-module-id .BFormTags {
    margin: 0;
}
</style>
