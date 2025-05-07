<template>
    <div class="filter-module-id mb-2">
        <label for="filter-module-id" class="d-flex justify-content-between align-items-center">
            <span>Filter Module ID</span>
            <button
                v-if="tags.length > 0"
                class="btn btn-link p-0 text"
                @click="clearAllTags"
                title="Clear all IDs"
            >
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
import { defineComponent, computed } from "vue";
import parsePart from "parse-numeric-range";

export default defineComponent({
    name: "SyllableIdFilter",
    props: {
        datasource: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            tags: [],
        };
    },
    computed: {
        availableIds(): number[] {
            return (
                this.$store.getters[`${this.datasource}/availableModuleIds`] || []
            );
        },
        tagsAsIds(): number[] {
            try {
                return parsePart(this.tags.join(",")) || [];
            } catch {
                return [];
            }
        },
    },
    watch: {
        tagsAsIds: {
            handler(newIds: number[], oldIds: number[]) {
                if (newIds.length > 0 && JSON.stringify(newIds) !== JSON.stringify(oldIds)) {
                    const newSelected = Math.min(...newIds); // Automatically select the lowest ID in the new filter
                    this.$store.commit(`${this.datasource}/setSelectedSyllable`, newSelected);
                }
            },
            deep: true,
        },
    },
    methods: {
        clearAllTags() {
            this.tags = [];
        },
        tagValidator(tag: string) {
            const ids = parsePart(tag) as number[];
            if (!ids || ids.length === 0) {
                return false; // Invalid if the tag cannot be parsed into IDs
            }
            // Check if every ID is in the available syllable options
            return ids.every((id) => this.availableIds.includes(id));
        },
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
