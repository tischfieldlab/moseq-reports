<template>
    <div>
        <b-dropdown text="Add Filter" class="add-filter-button" size="sm">
            <template v-for="col in columnOptions">
                <b-dropdown-item v-if="!columnAlreadyInFilter(col)" @click="addFilter(col)" :key="col">{{col}}</b-dropdown-item>
            </template>
        </b-dropdown>
        <template v-for="(value, key) in localFilters">
            <b-input-group :key="key" :prepend="`${key} (${inferDataTypeForColumn(key)})`">
                <b-form-tags 
                    v-model="localFilters[key]"
                    placeholder="Add filter value..."
                    duplicate-tag-text="Duplicate value(s)"
                    invalid-tag-text="Invalid value(s)"
                    tag-remove-label="Remove value" />
                <b-input-group-append is-text>
                    <b-button-close @click="removeFilter(key)" />
                </b-input-group-append>
            </b-input-group>
        </template>
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
        Operation: {
            type: Object as PropType<FilterOperation>,
            required: true,
        },
        PreviousResult: {
            required: true,
        },
        Owner: {
            type: String,
            required: true,
        },
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