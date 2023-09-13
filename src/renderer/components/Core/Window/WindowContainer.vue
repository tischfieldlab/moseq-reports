<template>
  <div>
    <template v-for="wid in windows" :key="wid">
      <UiCard :id="wid" />
    </template>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import UiCard from "@render/components/Core/Window/Window.vue";

export default defineComponent({
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
