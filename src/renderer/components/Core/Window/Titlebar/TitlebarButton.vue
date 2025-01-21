<template>
  <BButton
    v-b-tooltip="{ triggers: 'hover' }"
    :title="title"
    class="title-button"
    size="sm"
    variant="link"
    :disabled="disabled"
    @click="clicked"
  >
    <i :class="icon" aria-hidden="true"></i>
  </BButton>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TitlebarButton",
  props: {
    // Function to handle button click
    clicked: {
      type: Function as () => void,
      required: false,
      default: () => {},
    },
    // Icon to display
    icon: { type: String, required: true },
    // Tooltip title
    title: { type: String, required: false },
    // Disabled state
    disabled: { type: Boolean, required: false, default: false },
  },
});
</script>
<style scoped>
.title-button {
  width: 24px;
  height: 24px;
  color: #d61a1a;
  padding: 5px;
  margin-right: 2px;
}

.title-button:hover {
  color: #3a3a3a;
}

.title-button:focus,
.title-button:active {
  outline: none !important;
  box-shadow: none;
}

.title-button[disabled] {
  cursor: not-allowed;
  color: #989ea3;
}
</style>

