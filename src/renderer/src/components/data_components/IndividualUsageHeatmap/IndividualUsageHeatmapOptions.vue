<template>
    <div>
        <Colormap :id="this.id" />
        <RowOrdering :id="this.id" :column_options="availableUUIDs" />
        <ColumnOrdering
            :id="this.id"
            :row_options="column_order_row_value_options"
        />
        <b-row>
            <b-col>
                <b-input-group prepend="Color Column Labels">
                    <b-select
                        v-model="color_columns_data"
                        :options="color_columns_data_options"
                        :disabled="!color_columns"
                    />
                    <b-input-group-append is-text>
                        <b-form-checkbox v-model="color_columns" switch />
                    </b-input-group-append>
                </b-input-group>
            </b-col>
        </b-row>
    </div>
</template>

<script scoped lang="ts">
import Vue from "vue";
import mixins from "vue-typed-mixins";
import WindowMixin from "../../../components/Core/Window/WindowMixin";
import {
    Colormap,
    ColumnOrdering,
    RowOrdering,
} from "../../../components/Charts/ClusteredHeatmap/Options";
import LoadData from "../../../components/Core/DataLoader/DataLoader";

export default mixins(WindowMixin).extend({
    components: {
        Colormap,
        ColumnOrdering,
        RowOrdering,
    },
    computed: {
        column_order_row_value_options(): { text: string; value: string }[] {
            const syllables =
                this.$store.getters[`${this.datasource}/selectedSyllables`];
            return syllables.map((s) => ({ text: `${s}`, value: `${s}` }));
        },
        uuidSourceData(): any {
            const source = this.$store.getters[`datasets/resolve`]("samples");
            const filters = [
                {
                    type: "map",
                },
                {
                    type: "pluck",
                    column: "uuid",
                },
            ];
            return { source, filters };
        },
        color_columns_data_options() {
            return [{ text: "Group", value: "group" }];
        },
        color_columns: {
            get(): boolean {
                return this.settings.color_columns;
            },
            set(value: boolean) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        color_columns: value,
                    },
                });
            },
        },
        color_columns_data: {
            get(): string {
                return this.settings.color_columns_data;
            },
            set(value: string) {
                this.$store.commit(`${this.id}/updateComponentSettings`, {
                    id: this.id,
                    settings: {
                        color_columns_data: value,
                    },
                });
            },
        },
    },
    watch: {
        uuidSourceData: {
            async handler(newValue) {
                if (newValue === undefined) {
                    return;
                }
                this.availableUUIDs = await LoadData(
                    newValue.source,
                    newValue.filters,
                    false
                )
                    .then((data) => {
                        return data.map((uuid) => uuid.split("-").pop());
                    })
                    .then((data) => {
                        return data.map((uuid) => {
                            return { text: uuid, value: uuid };
                        });
                    });
            },
            immediate: true,
        },
    },
    data() {
        return {
            availableUUIDs: [] as { text: string; value: string }[],
        };
    },
});
</script>

<style scoped>
.row {
    margin: 10px 0;
}
</style>
