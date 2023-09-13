<template>
  <b-button-close v-b-tooltip.hover :title="title" class="close-button" @click="clicked" />
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "CloseButton",
  props: {
    /* tslint:disable-next-line */
    clicked: { type: Function, required: false, default: () => {} },
    title: { type: String, required: false },
  },
});
</script>

<style scoped>
.close-button {
  margin-left: 5px;
  cursor: pointer;
  margin-top: 4px;
}
</style>
