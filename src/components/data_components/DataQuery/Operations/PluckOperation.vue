<template>
    <b-input-group prepend="Column">
        <b-select v-model="Operation.column" :options="columnOptions" />
    </b-input-group>
</template>

<script lang="ts">
import { PluckOperation } from '@/components/Core/DataLoader/DataLoader.types';
import Vue, { PropType } from 'vue';


export default Vue.extend({
    props: {
        Operation: {
            type: Object as PropType<PluckOperation>,
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
        return {};
    },
    computed: {
        columnOptions() {
            const obj = this.PreviousResult as any;
            if (obj === undefined){
                return [];
            } else if (Array.isArray(obj)) {
                if (obj.length > 0) {
                    return Object.getOwnPropertyNames(obj[0])
                } else {
                    return [];
                }
            } else {
                return Object.getOwnPropertyNames(obj)
            }
        },
    },
});
</script>