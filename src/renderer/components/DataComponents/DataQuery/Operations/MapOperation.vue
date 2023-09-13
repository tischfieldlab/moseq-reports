<template>
  <b-input-group prepend="Columns" size="sm">
    <column-selector label="" v-model="localSelectedColumns" :options="columnOptions" :disabled="!isColumnsEnabled" />
    <b-input-group-append is-text title="Automatic mapping" v-b-tooltip.hover>
      <b-form-checkbox switch v-model="isColumnsEnabled" />
    </b-input-group-append>
  </b-input-group>
</template>

<script lang="ts">
import { MapOperation } from "@render/components/Core/DataLoader/DataLoader.types";
import { PropType, defineComponent } from "vue";
import ColumnSelector from "@render/components/DataComponents/DataQuery/Operations/ColumnSelector.vue";

export default defineComponent({
  components: {
    ColumnSelector,
  },
  props: {
    // Operation used to map data
    Operation: {
      type: Object as PropType<MapOperation>,
      required: true,
    },
    // Result of previously mapped data
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
      isColumnsEnabled: this.Operation.columns !== undefined,
      localSelectedColumns: this.Operation.columns || [],
    };
  },
  watch: {
    isColumnsEnabled: {
      handler(): void {
        if (!this.isColumnsEnabled) {
          this.Operation.columns = undefined;
        } else {
          this.Operation.columns = this.localSelectedColumns;
        }
      },
    },
    localSelectedColumns: {
      handler(): void {
        this.Operation.columns = this.localSelectedColumns;
      },
    },
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
});
</script>
