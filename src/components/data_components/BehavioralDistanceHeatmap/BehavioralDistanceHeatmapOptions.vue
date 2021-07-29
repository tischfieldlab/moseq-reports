<template>
    <div>
        <b-row>
            <b-col>
                <b-input-group prepend="Behavioral Distance Metric">
                    <b-form-select v-model="distance_metric" :options="method_options"></b-form-select>
                </b-input-group>
            </b-col>
        </b-row>
        <Colormap :id="this.id" />
        <RowOrdering :id="this.id" :column_options="value_options" />
        <ColumnOrdering :id="this.id" :row_options="value_options" />
    </div>
</template>

<script scoped lang="ts">
import Vue from 'vue';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';
import LoadData from '@/components/Core/DataLoader/DataLoader';
import { Colormap, ColumnOrdering, RowOrdering } from '@/components/Charts/ClusteredHeatmap/Options';


export default mixins(WindowMixin).extend({
    components: {
        Colormap,
        ColumnOrdering,
        RowOrdering,
    },
    watch: {
        method_options_spec: {
            async handler(newValue) {
                this.method_options = await LoadData(this.method_options_spec[0], this.method_options_spec[1])
                    .then((cols) => cols.filter((itm) => !itm.startsWith('row') && !itm.startsWith('col')));
            },
            immediate: true,
        },
    },
    computed: {
        method_options_spec(): any[] {
            const ds = this.$store.getters[`datasets/resolve`]('behave_dist');
            return [ds, [{ type: 'pluck', column: 'columns' }]];
        },
        value_options(): string[] {
            let vals;
            if (this.dataview.moduleIdFilter.length === 0) {
                vals = this.$store.getters[`${this.datasource}/availableModuleIds`];
            } else {
                vals = this.dataview.moduleIdFilter;
            }
            return vals.map((g) => ({text: g.toString(), value: g.toString()}));
        },
        distance_metric: {
            get(): string {
                return this.settings.distance_metric;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        distance_metric: value,
                    },
                });
            },
        },
    },
    data() {
        return {
            method_options: [] as string[],
        };
    },
});
</script>

<style scoped>
.row{
    margin:10px 0;
}
</style>
