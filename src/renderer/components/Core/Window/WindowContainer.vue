<template>
  <div>
    <template v-for="wid in windows" :key="wid">
      <UiCard :id="wid" />
      <p>{{ wid }}</p> <!-- Debug log in UI -->
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex"; // Ensure you're using the Vuex composable
import UiCard from "@render/components/Core/Window/Window.vue";

export default defineComponent({
  components: {
    UiCard,
  },
  setup() {
    const store = useStore(); // Use the Vuex store

    // Computed property for the reactive state
    const windows = computed(() => {
      console.log("State items:", store.state.datawindows.items);
      return store.state.datawindows.items;
    });

    return {
      windows,
    };
  },
});
</script>
