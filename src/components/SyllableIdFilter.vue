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
        tags(newValue) {
            this.module_filter = this.tagsAsIds;
        },
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
            if (ids.length === 1) {
                ranges.push(ids[0].toString());
            }
            if (ids.length <= 1) {
                return ranges;
            }
            ids = [...new Set(ids)].sort((a, b) => a - b);
            let start = ids[0];
            let stop = ids[0];
            for (let i = 1; i < ids.length; i++) {
                if (ids[i - 1] === (ids[i] - 1)) {
                    stop = ids[i];
                    if (i < ids.length - 1) {
                        continue;
                    }
                }

                if (start === stop) {
                    ranges.push(`${start}`);
                } else {
                    ranges.push(`${start}-${stop}`);
                }
                start = stop = ids[i];
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