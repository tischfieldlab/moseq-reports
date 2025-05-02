<template>
  <div class="dataview-container">
    <BButton
      @click="toggleExpand"
      :title="isExpanded ? 'Collapse' : 'Expand'"
      variant="link"
      class="text-dark collapse-button text-decoration-none"
    >
      <BIcon v-if="isExpanded" class="when-opened" title="Collapse" icon="chevron-up" />
      <BIcon v-else class="when-closed" title="Expand" icon="chevron-down" />
    </BButton>
    Results at this stage:
    <span class="datahint">{{ dataHint }}</span><br />
    <BCollapse v-model="isExpanded">
      <BFormTextarea
        v-model="formattedDataset"
        readonly
        rows="5"
        wrap="off"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="none"
        spellcheck="false"
      />
    </BCollapse>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
//import { BButton, BIcon, BCollapse, BFormTextarea } from 'bootstrap-vue-next';

const props = defineProps<{
  Dataset?: any;
  Collapsed?: boolean;
}>();

const isExpanded = ref(!props.Collapsed);

watch(
  () => props.Collapsed,
  (val) => {
    isExpanded.value = !val;
  }
);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const formattedDataset = computed(() =>
  JSON.stringify(props.Dataset ?? {}, null, '\t')
);

const dataHint = computed(() => {
  if (Array.isArray(props.Dataset)) {
    return `Array(${props.Dataset.length})`;
  }
  return typeof props.Dataset;
});
</script>

<style scoped>
.dataview-container {
  margin: 0.75rem 1.0rem;
}
.collapse-button {
  padding: 0;
}
textarea {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
}
.datahint {
  font-family: 'Courier New', Courier, monospace;
  color: #444;
}
</style>
