<template>
  <div>
    <b-button class="float-right add-sorting-button" size="sm" @click="addSorting()"> Add Sorting </b-button>

    <template v-for="(column, idx) in Operation.columns">
      <b-input-group :key="idx" prepend="Column" size="sm">
        <b-select v-model="column[0]" :options="columnOptions" />
        <b-select v-model="column[1]" :options="directionOptions" />
        <b-input-group-append is-text>
          <b-button-close @click="removeSorting(idx)" title="Remove this sorting" v-b-tooltip.hover />
        </b-input-group-append>
      </b-input-group>
    </template>
  </div>
</template>

<script lang="ts">
import { SortDirection, SortOperation } from "@render/components/Core/DataLoader/DataLoader.types";
import Vue, { PropType } from "vue";

export default Vue.extend({
  props: {
    // Operation used to sort data
    Operation: {
      type: Object as PropType<SortOperation>,
      required: true,
    },
    // Result of previously sorted data
    PreviousResult: {
      required: true,
    },
    // Name of the owner
    Owner: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      localSortings: this.Operation.columns || [],
      directionOptions: [
        { text: "Ascending", value: SortDirection.Asc },
        { text: "Descending", value: SortDirection.Desc },
      ],
    };
  },
  computed: {
    columnOptions() {
      const obj = this.PreviousResult as any;
      let objCols;
      if (obj === undefined) {
        return [];
      } else if (Array.isArray(obj)) {
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
  methods: {
    addSorting() {
      this.localSortings.push(["", "asc"]);
    },
    removeSorting(idx) {
      this.localSortings.splice(idx, 1);
    },
  },
});
</script>

<style scoped>
.add-sorting-button {
  margin-top: -3rem;
  margin-right: 50px;
}
.custom-select {
  height: calc(1.5em + 0.75rem + 2px) !important;
}
</style>
