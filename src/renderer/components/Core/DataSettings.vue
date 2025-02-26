<template>
    <b-container>
      <b-row>
        <b-col cols="10">
          <BInputGroup prepend="Data Source">
            <BFormSelect v-model="datasource" :options="available_sources" />
          </BInputGroup>
        </b-col>
        <b-col cols="1">
          <BButton @click="addDatasource">
            <BSpinner v-show="isAddingSource" small type="grow"></BSpinner>
            <span v-show="!isAddingSource">Add</span>
          </BButton>
        </b-col>
      </b-row>
    </b-container>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed } from "vue";
  import { useStore } from "vuex";
  import { unnest } from "@render/util/Vuex";
  import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";
  export default defineComponent({
    name: "DataSourceSelector",
    props: {
    id: {
      type: String,
      required: true,
    },
  },
    setup(props) {
      const store = useStore();
      const isAddingSource = ref(false);
      //const subid = computed(() => id.replace("datawindows/", ""));
      //const $wstate = computed(() => store.state.datawindows[subid.value] as DataWindowState);
      const {$wstate } = useWindowMixin(props.id);
      const datasource = computed({
      get() {
        return $wstate.value.datasource;
      },
      set(value: string) {
        store.commit(`${props.id}/updateComponentDataSource`, {
          source: value,
          id: props.id,
        });
      },
    });
  
      const available_sources = computed(() =>
        store.state.filters.items.map((sourceId: string) => {
          const source = unnest(store.state, sourceId);
          return { text: source.name, value: sourceId };
        })
      );
  
      
      const addDatasource = () => {
        isAddingSource.value = true;
        store
          .dispatch("filters/addFilter") 
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
  