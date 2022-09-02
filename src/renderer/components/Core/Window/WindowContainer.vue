<template>
  <div>
    <template v-for="wid in windows">
      <UiCard :key="wid" :id="wid" />
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import UiCard from "@render/components/Core/Window/Window.vue";

export default Vue.extend({
  components: {
    UiCard,
  },
  computed: {
    windows(): string[] {
      return this.$store.state.datawindows.items;
    },
  },
});
</script>
