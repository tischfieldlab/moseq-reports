<template>
    <b-container fluid>
        <Colormap :id="this.id" />
        <RowOrdering :id="this.id" :column_options="availableUUIDs" />
        <ColumnOrdering :id="this.id" :row_options="column_order_row_value_options" />
    </b-container>
</template>

<script scoped lang="ts">
import Vue from 'vue';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';
import { Colormap, ColumnOrdering, RowOrdering } from '@/components/Charts/ClusteredHeatmap/Options';
import LoadData from '@/components/Core/DataLoader/DataLoader';


export default mixins(WindowMixin).extend({
    components: {
        Colormap,
        ColumnOrdering,
        RowOrdering,
    },
    computed: {
        column_order_row_value_options(): {text: string, value: string}[] {
            const syllables = this.$store.getters[`${this.datasource}/selectedSyllables`];
            return syllables.map((s) => ({text: `${s}`, value: `${s}`}));
        },
        uuidSourceData(): any {
            const source = this.$store.getters[`datasets/resolve`]('samples');
            const filters = [
                {
                    type: 'map',
                },
                {
                    type: 'pluck',
                    column: 'uuid',
                },
            ];
            return {source, filters};
        }
    },
    watch: {
        uuidSourceData: {
            async handler(newValue) {
                if (newValue === undefined) {
                    return;
                }
                this.availableUUIDs = await LoadData(newValue.source, newValue.filters, false)
                    .then((data) => {
                        return data.map((uuid) => uuid.split('-').pop());
                    })
                    .then((data) => {
                        return data.map((uuid) => { return {text: uuid, value: uuid}; })
                    });
            },
            immediate: true,
        },
    },
    data() {
        return {
            availableUUIDs: [] as {text: string, value: string}[],
        };
    },
});
</script>

<style scoped>
.row{
    margin:10px 0;
}
</style>
