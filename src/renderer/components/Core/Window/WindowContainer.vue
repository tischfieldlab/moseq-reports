<template>
  <div>
    <template v-for="wid in windows" :key="wid">
      <UiCard :id="wid" />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex"; 
import UiCard from "@render/components/Core/Window/Window.vue";

export default defineComponent({
  components: {
    UiCard,
  },
  setup() {
    const store = useStore(); 
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
