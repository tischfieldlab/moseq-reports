<template>
    <div>
        <b-input-group prepend="Group By" size="sm">
            <column-selector
                label=""
                v-model="Operation.groupby"
                :options="columnOptions"
            />
        </b-input-group>

        <b-dropdown
            text="Add Aggregation"
            class="add-agg-button mx-auto"
            size="sm"
        >
            <template v-for="col in columnOptions">
                <b-dropdown-item
                    v-if="!columnAlreadyIncluded(col)"
                    @click="addAggregate(col)"
                    :key="col"
                    >{{ col }}</b-dropdown-item
                >
            </template>
        </b-dropdown>

        <template v-for="(value, key) in localAggs">
            <b-input-group :key="key" :prepend="key" size="sm">
                <column-selector
                    label=""
                    icon="calculator"
                    noun="Statistic"
                    v-model="localAggs[key]"
                    :options="statOptions"
                />
                <b-input-group-append is-text>
                    <b-button-close @click="removeAggregate(key)" />
                </b-input-group-append>
            </b-input-group>
        </template>
    </div>
</template>

<script lang="ts">
import { AggregateOperation } from "../../../../components/Core/DataLoader/DataLoader.types";
import Vue, { PropType } from "vue";
import ColumnSelector from "./ColumnSelector.vue";

export default Vue.extend({
    components: {
        ColumnSelector,
    },
    props: {
        Operation: {
            type: Object as PropType<AggregateOperation>,
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
            localAggs: this.Operation.aggregate || {},
        };
    },
    watch: {
        localAggs: {
            handler(): void {
                this.Operation.aggregate = this.localAggs;
            },
        },
    },
    computed: {
        columnOptions() {
            const obj = this.PreviousResult as any;
            if (obj === undefined) {
                return [];
            } else if (Array.isArray(obj)) {
                if (obj.length > 0) {
                    return Object.getOwnPropertyNames(obj[0]);
                } else {
                    return [];
                }
            } else {
                return Object.getOwnPropertyNames(obj);
            }
        },
        statOptions() {
            return [
                "mean",
                "median",
                "sum",
                "min",
                "max",
                "extent",
                "variance",
                "deviation",
                "count",
            ];
        },
    },
    methods: {
        addAggregate(colName) {
            Vue.set(this.localAggs, colName, []);
        },
        removeAggregate(colName) {
            Vue.delete(this.localAggs, colName);
        },
        columnAlreadyIncluded(colName) {
            return Object.getOwnPropertyNames(this.localAggs).includes(colName);
        },
    },
});
</script>

<style scoped>
.add-agg-button {
    margin: 0.25rem 0;
}
</style>
