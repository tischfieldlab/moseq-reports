<template>
    <div>
        <b-dropdown text="Add Filter" class="float-right add-filter-button" size="sm">
            <template v-for="col in columnOptions">
                <b-dropdown-item v-if="!columnAlreadyInFilter(col)" @click="addFilter(col)" :key="col">{{col}}</b-dropdown-item>
            </template>
        </b-dropdown>

        <template v-for="(value, key) in localFilters">
            <b-input-group size="sm" :key="key">
                <b-input-group-prepend is-text :title="`${inferDataTypeForColumn(key)} datatype`" v-b-tooltip.hover>
                    {{key}}
                </b-input-group-prepend>
                <b-form-tags
                    v-model="localFilters[key]"
                    placeholder="Add value..."
                    duplicate-tag-text="Duplicate value(s)"
                    invalid-tag-text="Invalid value(s)"
                    tag-remove-label="Remove value" />
                <b-input-group-append is-text>
                    <b-button-close @click="removeFilter(key)" title="Remove this filter" v-b-tooltip.hover />
                </b-input-group-append>
            </b-input-group>
        </template>

        <div class="special-token-container">
            Special Tokens:
            <template v-for="(value, key) in SpecialTokens">
                <b-tag :key="key" class="special-token" no-remove pill variant="info">
                    <span :title="JSON.stringify(value)" v-b-tooltip.hover>{{key}}</span>
                </b-tag>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { FilterOperation } from '@/components/Core/DataLoader/DataLoader.types';
import Vue, { PropType } from 'vue';
import ColumnSelector from './ColumnSelector.vue';


export default Vue.extend({
    components: {
        ColumnSelector,
    },
    props: {
        // Operation used to filter data
        Operation: {
            type: Object as PropType<FilterOperation>,
            required: true,
        },
        // Result of previously filtered data
        PreviousResult: {
            required: true,
        },
        // Name of the owner
        Owner: {
            type: String,
            required: true,
        },
        // Any special tokens used in filtering data
        SpecialTokens: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            localFilters: this.Operation.filters || {},
        };
    },
    watch: {
        localFilters: {
            handler(): void {
                this.Operation.filters = this.localFilters;
            },
            deep: true,
        },
    },
    computed: {
        columnOptions(): string[] {
            const obj = this.PreviousResult as any;
            let objCols;
            if (obj === undefined){
                return [];
            } else if (Array.isArray(obj)) {
                if (obj.length > 0) {
                    objCols = Object.getOwnPropertyNames(obj[0]);
                } else {
                    objCols = [];
                }
            } else if (obj.columns !== undefined && obj.data !== undefined) {
                objCols = obj.columns;
            }

            return objCols;
        },
    },
    methods: {
        addFilter(colName) {
            Vue.set(this.localFilters, colName, []);
        },
        removeFilter(colName) {
            Vue.delete(this.localFilters, colName);
        },
        columnAlreadyInFilter(colName) {
            return Object.getOwnPropertyNames(this.localFilters).includes(colName);
        },
        inferDataTypeForColumn(colName: string) {
            const obj = this.PreviousResult;
            if (Array.isArray(obj)) {
                if (obj.length > 0) {
                    const value = obj[0][colName]
                    const type = typeof value;
                    if (type === 'number') {
                        return Number.isInteger(value) ? 'int' : 'float';
                    } else {
                        return type;
                    }
                }
            }
            return 'undefined';
        },
    },
});
</script>

<style scoped>
.add-filter-button {
    margin-top:-3rem;
    margin-right: 50px;
}
.data-type {
    padding-left: 6px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 11px;
}
.special-token-container {
    margin-top: 0.5rem;
    color: #666
}
</style>