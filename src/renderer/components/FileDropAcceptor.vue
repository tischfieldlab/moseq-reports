<template>
  <Teleport to="body">
    <div
      ref="acceptor"
      v-show="is_file_hover"
      class="file-acceptor-wrapper"
      @dragleave="hideOverlay"
      @drop="onFileDrop"
    >
      <div class="file-acceptor"></div>
      <BCard bg-variant="primary" text-variant="white" class="text-center">
        <BCardText>
          Drop your <code>{{ file_associations[0].ext }}</code> Data Bundle or
          <code>.{{ file_associations[1].ext }}</code> Layout files here!
        </BCardText>
      </BCard>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
import { LoadDataFile } from "@render/commands/LoadData";
import { LoadLayoutFile } from "@render/commands/LoadLayout";

export default defineComponent({
  name: "FileDropAcceptor",
  setup() {
    const is_file_hover = ref(false);

  
    const file_associations = [
      {
        ext: ".msq",
        handler: LoadDataFile,
      },
      {
        ext: ".msl",
        handler: LoadLayoutFile,
      },
    ];

    // Hides overlay when drag leaves
    const hideOverlay = (ev: DragEvent) => {
      is_file_hover.value = false;
      ev.preventDefault();
    };

    // Prevents default drag behaviors
    const dragEventPreventDefault = (ev: DragEvent) => ev.preventDefault();

    // Handles drag enter to show overlay
    const onFileDragEnter = (ev: DragEvent) => {
      if (ev.dataTransfer && ev.dataTransfer.types.includes("Files")) {
        is_file_hover.value = true;
        ev.preventDefault();
      }
    };

    // Handles file drop event
    const onFileDrop = (ev: DragEvent) => {
      is_file_hover.value = false;
      ev.preventDefault();

      if (ev.dataTransfer && ev.dataTransfer.files.length > 0) {
        const file = ev.dataTransfer.files[0];
        const filename = file.name.toLowerCase();
        const { webUtils } = require('electron')
        const filePath = webUtils.getPathForFile(file)
        const matchedAssoc = file_associations.find((assoc) =>
          filename.endsWith(assoc.ext)
        );

        if (matchedAssoc) {
          matchedAssoc.handler(filePath); 
        } else {
          alert(`Unsupported file type: "${file.name}". Please upload a .msq or .msl file.`);
        }
      } else {
        console.warn("No valid files were dropped or dataTransfer is null.");
      }
    };

    // Sets up drag event listeners
    const watchDrop = () => {
      document.body.addEventListener("dragenter", onFileDragEnter);
      document.body.addEventListener("dragover", dragEventPreventDefault);
      document.body.addEventListener("dragleave", dragEventPreventDefault);
      document.body.addEventListener("drop", dragEventPreventDefault);
    };

    // Removes drag event listeners
    const unwatchDrop = () => {
      document.body.removeEventListener("dragenter", onFileDragEnter);
      document.body.removeEventListener("dragover", dragEventPreventDefault);
      document.body.removeEventListener("dragleave", dragEventPreventDefault);
      document.body.removeEventListener("drop", dragEventPreventDefault);
    };

    // Lifecycle hooks
    onMounted(watchDrop);
    onBeforeUnmount(unwatchDrop);

    return {
      is_file_hover,
      file_associations,
      hideOverlay,
      onFileDrop,
    };
  },
});
</script>

<style scoped>
.file-acceptor-wrapper {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  z-index: 2147483647;
  display: flex;
  justify-content: center;
  align-items: center;
}

.file-acceptor {
  width: 100%;
  height: 100%;
  border: 1em dashed #666;
  background: #e9ecef;
  opacity: 0.8;
}

.file-acceptor-wrapper * {
  pointer-events: none;
}

.card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99999;
}
</style>
