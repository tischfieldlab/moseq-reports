<template>
    <BContainer>
        <BRow>
            <BCol cols="10">
                <BInputGroup prepend="Data Source">
                    <BFormSelect v-model="datasource" :options="available_sources" />
                </BInputGroup>
            </BCol>
            <BCol cols="1">
                <BButton @click="addDatasource">
                    <BSpinner v-show="isAddingSource" small type="grow"></BSpinner>
                    <span v-show="!isAddingSource">Add</span>
                </BButton>
            </BCol>
        </BRow>
    </BContainer>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";

import { useDataWindowStore } from "@store/datawindow.store"
import { useFiltersStore } from "@store/filters.store";
import { useDataViewStore } from "@store/dataview.store";


export default defineComponent({
    name: "DataSourceSelector",
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const isAddingSource = ref(false);
        const {$wstate} = useWindowMixin(props.id);
        const datasource = computed({
            get() {
                return $wstate.datasource;
            },
            set(value: string) {
                useDataWindowStore(props.id).updateComponentDataSource({
                    source: value,
                    id: props.id,
                });
            },
        });

        const filtersStore = useFiltersStore();
        const available_sources = computed(() =>
            filtersStore.items.map((sourceId: string) => {
                return { 
                    text: useDataViewStore(sourceId).name,
                    value: sourceId
                };
            })
        );

        const addDatasource = () => {
            isAddingSource.value = true;
            filtersStore.addFilter()
                .finally(() => {
                    isAddingSource.value = false;
                });
        };

        return {
            isAddingSource,
            datasource,
            available_sources,
            addDatasource,
        };
    },
});
</script>

<style scoped>
.row {
    margin: 10px 0;
}
</style>
