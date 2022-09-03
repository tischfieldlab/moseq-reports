<template>
  <b-button
    v-b-tooltip.hover
    :title="title"
    class="title-button"
    size="sm"
    variant="link"
    :class="{ 'disabled-icon-button': disabled }"
    @click="clicked"
  >
    <b-icon :icon="icon" />
  </b-button>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "TitlebarButton",
  props: {
    /* tslint:disable-next-line */
    // Function for when the titlebar is clicked
    clicked: {
      type: Function,
      required: false,
      default: () => {
        /* do nothing */
      },
    },
    // icon to use for this titlebar button
    icon: { type: String, required: true },
    // Title attribute for this titlebar button, shown on hover via a tooltip
    title: { type: String, required: false },
    // True if this titlebar button should be disabled, otherwise false
    disabled: { type: Boolean, required: false, default: false },
  },
});
</script>

<style scoped>
.title-button {
  width: 24px;
  height: 24px;
  color: #747474;
  padding: 5px;
  margin-right: 2px;
}

.title-button:hover {
  color: #3a3a3a;
}

.title-button:focus,
title-button:active {
  outline: none !important;
  box-shadow: none;
}

.disabled-icon-button:hover {
  cursor: not-allowed !important;
  color: #989ea3;
}
.disabled-icon-button {
  color: #989ea3;
}
</style>
