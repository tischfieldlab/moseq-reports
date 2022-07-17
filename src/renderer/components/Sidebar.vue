<template>
  <Portal>
    <div :class="{ 'button-bar': true, 'shadow-lg': !is_open, right: right }">
      <div
        v-for="itm in items"
        :key="itm.name"
        v-show="showItem(itm)"
        :style="{ 'justify-self': itm.align }"
        :title="current === itm ? `Hide ${itm.name}` : `Show ${itm.name}`"
      >
        <b-icon
          :class="{ active: current === itm }"
          :icon="current === itm ? itm.icon[0] : itm.icon[1]"
          v-on:click="() => toggleItem(itm)"
        ></b-icon>
      </div>
    </div>

    <b-sidebar
      id="sidebar-1"
      :visible="is_open"
      @change="sidebar_visibility_changed"
      no-header
      :title="current ? current.name : ''"
      :right="right"
      shadow="lg"
    >
      <keep-alive>
        <component :is="current ? current.component : ''" />
      </keep-alive>
    </b-sidebar>
  </Portal>
</template>

<script lang="ts">
import Vue from "vue";

// import DataFilterContainer from "@/components/DataFilterContainer.vue";
// import HistoryViewer from "@/components/HistoryViewer.vue";
import { Portal } from "@linusborg/vue-simple-portal";

interface SidebarItem {
  name: string;
  icon: [string, string];
  component: string;
  align: string;
  isVisible: () => boolean;
}

export default Vue.extend({
  name: "Sidebar",
  components: {
    Portal,
    // DataFilterContainer,
    // HistoryViewer,
  },
  props: {
    // A boolean describing if sidebar appears on the right side
    right: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      is_open: false,
      current: undefined as SidebarItem | undefined,
      items: [
        {
          name: "Data Filters",
          icon: ["funnel-fill", "funnel"],
          component: "DataFilterContainer",
          align: "flex-start",
          // isVisible: () => this.$store.state.datasets.name !== "",
          isVisible: () => true,
        } as SidebarItem,
        {
          name: "History",
          icon: ["clock-fill", "clock-history"],
          component: "HistoryViewer",
          align: "flex-end",
          isVisible: () => true,
        } as SidebarItem,
      ],
    };
  },
  computed: {
    showItem: () => (item: SidebarItem) => {
      return item.isVisible();
    },
  },
  methods: {
    openItem(name) {
      this.current = this.items.find((i) => i.name === name);
      this.is_open = this.current !== undefined;
    },
    toggleItem(item) {
      if (this.current === item) {
        this.close();
      } else {
        this.openItem(item.name);
      }
    },
    close() {
      this.current = undefined;
      this.is_open = false;
    },
    sidebar_visibility_changed(visibility: boolean) {
      this.is_open = visibility;
    },
  },
});
</script>

<style scoped>
.button-bar {
  display: flex;
  flex-direction: column;
  justify-items: flex-start;
  position: fixed;
  padding-top: 12px;
  width: 48px;
  top: 30px;
  bottom: 0;
  background-color: #ffffff; /*#f8f9fa*/
  z-index: 1050;
}
.button-bar.right {
  right: 0;
}
.button-bar .b-icon {
  width: 48px;
  height: 48px;
  padding: 6px;
  cursor: pointer;
}
.button-bar:not(.right) .b-icon.active {
  border-left: 3px solid #2c3e50;
}
.button-bar.right .b-icon.active {
  border-right: 3px solid #2c3e50;
}
.b-sidebar-outer >>> .b-sidebar {
  top: 30px;
  height: calc(100vh - 30px) !important;
}
.b-sidebar-outer >>> .b-sidebar:not(.b-sidebar-right) {
  left: 48px;
}
.b-sidebar-outer >>> .b-sidebar.b-sidebar-right {
  right: 48px;
}
</style>
