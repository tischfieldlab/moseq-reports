<template>
    <b-container fluid>
        <Colormap :id="this.id" />
        <RowOrdering :id="this.id" :column_options="row_order_column_value_options" />
        <ColumnOrdering :id="this.id" :row_options="column_order_row_value_options" />
    </b-container>
</template>

<script scoped lang="ts">
import Vue from 'vue';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';
import { Colormap, ColumnOrdering, RowOrdering } from '@/components/Charts/ClusteredHeatmap/Options';


export default mixins(WindowMixin).extend({
    components: {
        Colormap,
        ColumnOrdering,
        RowOrdering,
    },
    computed: {
        row_order_column_value_options(): {text: string, value: string}[] {
            return this.dataview.selectedGroups.map((g) => ({text: g, value: g}));
        },
        column_order_row_value_options(): {text: string, value: string}[] {
            const syllables = this.$store.getters[`${this.datasource}/selectedSyllables`];
            return syllables.map((s) => ({text: `${s}`, value: `${s}`}));
        },
    },
});
</script>

<style scoped>
.row{
    margin:10px 0;
}
</style>
