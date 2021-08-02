<template>
    <b-input-group prepend="Columns" size="sm">
        <column-selector label="" v-model="localSelectedColumns" :options="columnOptions" :disabled="!isColumnsEnabled" />
        <b-input-group-append is-text title="Automatic mapping" v-b-tooltip.hover>
            <b-form-checkbox switch v-model="isColumnsEnabled" />
        </b-input-group-append>
    </b-input-group>
</template>

<script lang="ts">
import { MapOperation } from '@/components/Core/DataLoader/DataLoader.types';
import Vue, { PropType } from 'vue';
import ColumnSelector from './ColumnSelector.vue';


export default Vue.extend({
    components: {
        ColumnSelector,
    },
    props: {
        Operation: {
            type: Object as PropType<MapOperation>,
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
            isColumnsEnabled: this.Operation.columns !== undefined,
            localSelectedColumns: this.Operation.columns || [],
        };
    },
    watch: {
        isColumnsEnabled: {
            handler(): void {
                if (!this.isColumnsEnabled) {
                    this.Operation.columns = undefined;
                } else {
                    this.Operation.columns = this.localSelectedColumns;
                }
            },
        },
        localSelectedColumns: {
            handler(): void {
                this.Operation.columns = this.localSelectedColumns;
            }
        },
    },
    computed: {
        columnOptions() {
            const obj = this.PreviousResult as any;
            let objCols;
            if (obj === undefined) {
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
});
</script>