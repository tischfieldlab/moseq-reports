<template>
  <div class="home">
    <!-- <Sidebar :right="isSidebarRight" />
        <NoDataPresent />
        <WindowContainer />
        <FileDropAcceptor /> -->
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.component("homepage", {
  name: "homepage",
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
