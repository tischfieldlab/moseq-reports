<template>
  <div class="home">
    <!-- <Sidebar :right="isSidebarRight" />
        <NoDataPresent />
        <WindowContainer />
        <FileDropAcceptor /> -->
  </div>
</template>

<script lang="ts">
import { UpdateTitle } from "@render/core/ChromeWindow";
import Vue from "vue";

export default Vue.component("homepage", {
  name: "homepage",
  computed: {
    title() {
      let title = "MoSeq Reports";
      // const currFile = this.$store.state.datasets.name;
      const currFile = undefined;
      if (currFile) {
        title += " - " + currFile;
      }
      return title;
    },
    isSidebarRight(): boolean {
      // return this.$store.state.sidebarPosition === SidebarPosition.Right;
      return false;
    },
  },
  watch: {
    title: {
      handler() {
        UpdateTitle(this.title);
      },
      immediate: true,
    },
  },
});
</script>

<style scoped lang="scss">
.home {
  background-color: #e9ecef;
  height: 100%;
  width: 100%;
  position: fixed;
}
</style>
