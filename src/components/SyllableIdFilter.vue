<template>
    <b-card no-body >
        <div class="input-group-text">
            Filter Module ID
            <b-button-close v-show="hasTags" @click="clearAllTags" title="Clear all IDs" />
        </div>
        <b-form-tags v-model="tags" class="mb-2"
            separator=" ,;"
            :tag-validator="tagValidator"
            placeholder="Add ID(s)..."
            ></b-form-tags>
    </b-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataviewState } from '@/store/dataview.types';
import { unnest } from '@/util/Vuex';
import parsePart from 'parse-numeric-range';
import { join } from 'custom-electron-titlebar/lib/common/dom';


export default Vue.component('syllable-id-filter', {
    props: {
        datasource: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            tags: Array<string>(),
            dirty: true,
        };
    },
    computed: {
        dataview(): DataviewState {
            return unnest(this.$store.state, this.datasource);
        },
        isValid(): boolean {
            // Overall component validation state
            return false;
        },
        hasTags(): boolean {
            return this.tags.length > 0;
        },
        tagsAsIds(): number[] {
            let ids = parsePart(this.tags.join(',')) as number[];
            ids = [...new Set(ids)].sort((a, b) => a - b);
            return ids;
        },
        tagsAsRanges(): string[] {
            return this.idsToRanges(this.tagsAsIds);
        },
        module_filter: {
            get(): number[] {
                return this.dataview.moduleIdFilter || [];
            },
            set(event: number[]) {
                this.$store.dispatch(`${this.datasource}/updateModuleIdFilters`, event);
            },
        },
        syllableIdOptions() {
            return this.$store.getters[`${this.datasource}/availableModuleIds`];
        },
    },
    watch: {
        tags(newValue, oldValue) {
            if (newValue !== oldValue) {
                this.module_filter = this.tagsAsIds;
            }
        },
        module_filter(newValue, oldValue) {
            const newTags = this.idsToRanges(newValue);
            if (JSON.stringify(newTags) !== JSON.stringify(this.tags)) {
                this.tags = newTags;
            }
        }
    },
    mounted() {
        this.tags = this.idsToRanges(this.module_filter);
    },
    methods: {
        clearAllTags() {
            this.tags.splice(0, this.tags.length);
        },
        tagValidator(tag) {
            // Individual tag validator function
            const ids = parsePart(tag) as number[];
            if (ids.length <= 0) {
                return false;
            }
            for (const id of ids) {
                if (!(id in this.syllableIdOptions)) {
                    return false;
                }
            }
            return true;
        },
        idsToRanges(ids: number[]): string[] {
            const ranges: string[] = [];
            const sortedIds: number[] = [...ids];

            // These are used to track where we are in the range, should one exist
            let rstart: number;
            let rend: number;
            for (let i = 0; i < sortedIds.length; ++i) {
                rstart = sortedIds[i];
                rend = rstart;
                // Loop through if they are sequential
                while (sortedIds[i + 1] - sortedIds[i] === 1) {
                    rend = sortedIds[i + 1]; // increment the index if the numbers sequential
                    i++;
                }

                ranges.push(rstart === rend ? rstart+'' : rstart + '-' + rend);
            }

            return ranges;
        },
    },
});
</script>

<style scoped lang="scss">
.input-group-text {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    margin: -1px;
}
.b-form-tags {
    margin:0 !important;
    border: none;
    background: none;
}
button.close {
    margin-left: auto;
}
</style>