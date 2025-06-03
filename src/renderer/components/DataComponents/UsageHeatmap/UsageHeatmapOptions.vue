<template>
    <div>
        <Colormap :id="id" />
        <RowOrdering :id="id" :column_options="row_order_column_value_options" />
        <ColumnOrdering :id="id" :row_options="column_order_row_value_options" />
    </div>
</template>

<script lang="ts">
import {defineComponent, computed} from 'vue';
import {useWindowMixin} from '@render/components/Core/Window/WindowMixin';
import {Colormap, ColumnOrdering, RowOrdering} from '@render/components/Charts/ClusteredHeatmap';


export default defineComponent({
    components: {
        Colormap,
        ColumnOrdering,
        RowOrdering,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const {dataview} = useWindowMixin(props.id);

        const row_order_column_value_options = computed((): {text: string, value: string}[] => {
            return dataview.selectedGroups.map((g) => ({text: g, value: g}));
        });
        const column_order_row_value_options = computed((): {text: string, value: string}[] => {
            return dataview.selectedSyllables.map((s) => ({text: `${s}`, value: `${s}`}));
        });

        return {
            row_order_column_value_options,
            column_order_row_value_options,
        };
    },
});
</script>

<style scoped>
.row{
    margin:10px 0;
}
</style>