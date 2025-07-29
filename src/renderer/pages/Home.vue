<template>
  <div class="home">
    <Sidebar :right="isSidebarRight" />
    <NoDataPresent />
    <WindowContainer />
    <FileDropAcceptor />
    <BToastOrchestrator />
    <About />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Sidebar from "@render/components/Sidebar.vue";
import NoDataPresent from "@render/components/NoDataPresent.vue";
import FileDropAcceptor from "@render/components/FileDropAcceptor.vue";
import WindowContainer from "@render/components/Core/Window/WindowContainer.vue";
import { useSidebarStore, SidebarPosition } from "@store/sidebar.store";
import { useDatasetsStore } from "@store/datasets.store";
import About from "@render/components/About.vue";



export default defineComponent({
    name: "homepage",
    components: {
        Sidebar,
        NoDataPresent,
        FileDropAcceptor,
        WindowContainer,
        About,
    },
    computed: {
        title() {
            const datasetStore = useDatasetsStore();
            let title = "MoSeq Reports";
            const currFile = datasetStore.name;
            if (currFile) {
                title += " - " + currFile;
            }
            return title;
        },
        isSidebarRight(): boolean {
            const sidebarStore = useSidebarStore();
            return sidebarStore.sidebarPosition === SidebarPosition.Right;
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
