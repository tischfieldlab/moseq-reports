<template>
  <div class="dataview-container">
    <b-button
      @click="is_expanded = !is_expanded"
      :title="is_expanded ? 'Collapse' : 'Expand'"
      variant="link"
      class="text-dark collapse-button text-decoration-none"
    >
      <b-icon v-if="is_expanded" class="when-opened" title="Collapse" icon="chevron-up"></b-icon>
      <b-icon v-else class="when-closed" title="Expand" icon="chevron-down"></b-icon>
    </b-button>
    Results at this stage:
    <span class="datahint">{{ datahint }}</span
    ><br />
    <b-collapse v-model="is_expanded">
      <b-form-textarea
        v-model="formattedDataset"
        :readonly="true"
        rows="5"
        wrap="off"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="none"
        spellcheck="false"
      />
    </b-collapse>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    // Dataset being viewed
    Dataset: {
      required: false,
    },
    // Boolean describing if the dataset is collapsed
    Collapsed: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      is_expanded: !this.Collapsed,
    };
  },
  watch: {
    Collapsed: {
      handler(): void {
        this.is_expanded = !this.Collapsed;
      },
    },
  },
  computed: {
    formattedDataset(): string {
      return JSON.stringify(this.Dataset, null, "\t");
    },
    datahint(): string {
      if (Array.isArray(this.Dataset)) {
        return `Array(${this.Dataset.length})`;
      }
      return typeof this.Dataset;
    },
  },
});
</script>

<style scoped>
.dataview-container {
  margin: 0.75rem 1rem;
}
.collapse-button {
  padding: 0;
}
textarea {
  font-family: "Courier New", Courier, monospace;
  font-size: 10px;
}
.datahint {
  font-family: "Courier New", Courier, monospace;
  color: #444;
}
</style>
