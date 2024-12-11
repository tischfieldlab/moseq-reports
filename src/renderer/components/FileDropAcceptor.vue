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
      <b-card bg-variant="primary" text-variant="white" class="text-center">
        <b-card-text>
          <!-- Drop your <code text-variant="white">.{{ file_associations[0].ext }}</code> Data Bundle or -->
          <!-- <code text-variant="white">.{{ file_associations[1].ext }}</code> Layout files here! -->
        </b-card-text>
      </b-card>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
import { LoadDataFile, DataFileExt } from "@render/commands/LoadData";
import { LoadLayoutFile, LayoutFileExt } from "@render/commands/LoadLayout";

export default defineComponent({
  setup() {
    const is_file_hover = ref(false);
    const file_associations = ref([
      {
        ext: DataFileExt,
        handler: LoadDataFile,
      },
      {
        ext: LayoutFileExt,
        handler: LoadLayoutFile,
      },
    ]);

    const acceptor = ref<HTMLElement | null>(null);

    const hideOverlay = (ev: DragEvent) => {
      is_file_hover.value = false;
      ev.preventDefault();
    };

    const dragEventPreventDefault = (ev: DragEvent) => {
      ev.preventDefault();
    };

    const onFileDragEnter = (ev: DragEvent) => {
      if (ev && ev.dataTransfer && acceptor.value && ev.composedPath().includes(acceptor.value)) {
        is_file_hover.value = true;
        ev.preventDefault();
      }
    };

    const onFileDrop = (ev: DragEvent) => {
      is_file_hover.value = false;
      ev.preventDefault();

      if (ev.dataTransfer && ev.dataTransfer.files.length > 0) {
        const filepath = ev.dataTransfer.files[0].path;
        for (const assoc of file_associations.value) {
          const ext = filepath.substr(-assoc.ext.length);
          if (ext.toLowerCase() === assoc.ext.toLowerCase()) {
            assoc.handler(filepath);
            break;
          }
        }
      }
    };

    const watchDrop = () => {
      const parent = document.body;
      parent.addEventListener("dragenter", onFileDragEnter);
      parent.addEventListener("dragover", dragEventPreventDefault);
      parent.addEventListener("dragleave", dragEventPreventDefault);
      parent.addEventListener("drop", dragEventPreventDefault);
    };

    const unwatchDrop = () => {
      const parent = document.body;
      parent.removeEventListener("dragenter", onFileDragEnter);
      parent.removeEventListener("dragover", dragEventPreventDefault);
      parent.removeEventListener("dragleave", dragEventPreventDefault);
      parent.removeEventListener("drop", dragEventPreventDefault);
    };

    onMounted(() => {
      watchDrop();
    });

    onBeforeUnmount(() => {
      unwatchDrop();
    });

    return {
      is_file_hover,
      file_associations,
      hideOverlay,
      dragEventPreventDefault,
      onFileDragEnter,
      onFileDrop,
      acceptor,
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
code {
  color: #afafaf;
}
</style>
