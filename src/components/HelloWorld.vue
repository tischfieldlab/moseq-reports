<template>
  <div class="home">
      <Sidebar :right="isSidebarRight" />
      <NoDataPresent />
      <WindowContainer />
      <FileDropAcceptor />
      <p>hello</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import WindowContainer from '@/components/Core/Window/WindowContainer.vue';
import NoDataPresent from '@/components/NoDataPresent.vue';
import FileDropAcceptor from '@/components/FileDropAcceptor.vue';
import { useStore } from 'vuex';
import { SidebarPosition } from '../store/root.types';

// Use the Vuex store
const store = useStore();

// Computed properties
const title = computed(() => {
  let title = 'Moseq Reports';
  const currFile = store.state.datasets.name;
  if (currFile) {
    title += ' - ' + currFile;
  }
  return title;
});

const isSidebarRight = computed(() => {
  return store.state.sidebarPosition === SidebarPosition.Right;
});

// Watch the title and update it
import { watch } from 'vue';
watch(title, (newTitle) => {
  UpdateTitle(newTitle);
}, { immediate: true });

// Function to update the title
function UpdateTitle(title: string) {
  document.title = title;
}
</script>

<style scoped lang="scss">
.home {
  background-color: #e9ecef;
  height: 100%;
  width: 100%;
  position: fixed;
}
</style>
