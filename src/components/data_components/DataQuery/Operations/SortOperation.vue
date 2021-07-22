<template>
    <div>
        <column-selector v-model="Operation.columns" :options="columnOptions" />
        <b-select v-model="Operation.direction" :options="directionOptions" />
    </div>
</template>

<script lang="ts">
import { SortDirection, SortOperation } from '@/components/Core/DataLoader/DataLoader.types';
import Vue, { PropType } from 'vue';
import ColumnSelector from './ColumnSelector.vue';


export default Vue.extend({
    components: {
        ColumnSelector,
    },
    props: {
        Operation: {
            type: Object as PropType<SortOperation>,
            required: true,
        },
        PreviousResult: {
            required: true,
        },
    },
    data() {
        return {
            directionOptions: [
                {text: 'Ascending', value: SortDirection.Asc},
                {text: 'Descending', value: SortDirection.Desc},
            ]
        };
    },
    computed: {
        columnOptions() {
            const obj = this.PreviousResult as any;
            let objCols;
            if (Array.isArray(obj)) {
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