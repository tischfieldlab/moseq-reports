<template>
  <div class="has-no-data-container">
    <img :style="{ visibility: show_background ? 'visible' : 'hidden' }" src="/img/mouse.png" />
    <h4 :style="{ visibility: show_help_text ? 'visible' : 'hidden' }">
      No data loaded. Please
      <a href="#" @click="initiateFileOpen">load some data</a>
      by clicking File > Open File.
    </h4>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import { EventEmitter } from "@render/util/EventEmitter";
import loadDataCommand from "@render/commands/LoadData";

export default defineComponent({
  setup() {
    const show_help_text = ref(true);
    const show_background = ref(true);

    const handleBeginDatasetLoad = () => {
      show_help_text.value = false;
    };
    const handleFailDatasetLoad = () => {
      show_help_text.value = true;
    };

    onMounted(() => {
      EventEmitter.on("begin-dataset-load", handleBeginDatasetLoad);
      EventEmitter.on("fail-dataset-load", handleFailDatasetLoad);
    });

    onUnmounted(() => {
      EventEmitter.off("begin-dataset-load", handleBeginDatasetLoad);
      EventEmitter.off("fail-dataset-load", handleFailDatasetLoad);
    });

    const initiateFileOpen = () => {
       loadDataCommand();
    };

    return {
      show_help_text,
      show_background,
      initiateFileOpen,
    };
  },
});
</script>

<style scoped>
.has-no-data-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: inherit;
}
.has-no-data-container img {
  opacity: 0.2;
  margin-top: -10%;
  pointer-events: none;
  user-select: none;
}
.has-no-data-container h4 {
  margin-top: -80px;
  pointer-events: none;
  user-select: none;
}
.has-no-data-container h4 a {
  pointer-events: auto;
}
</style>
