<template>
  <Teleport to="body">
    <!-- Sidebar toggle buttons -->
    <div :class="{ 'button-bar': true, 'shadow-lg': !is_open, right: right }">
      <div
        v-for="itm in items"
        :key="itm.name"
        v-show="showItem(itm)"
        :style="{ 'justify-self': itm.align }"
        :title="current === itm ? `Hide ${itm.name}` : `Show ${itm.name}`"
      >
        <!-- Using native Bootstrap icon classes and click event -->
        <button class="btn btn-link" @click="toggleItem(itm)">
          <i :class="current === itm ? itm.icon[0] : itm.icon[1]"></i>
        </button>
      </div>
    </div>

    <!-- Custom sidebar using Bootstrap's offcanvas classes -->
    <div
      class="offcanvas offcanvas-start"
      :class="{ show: is_open }"
      tabindex="-1"
      id="sidebar"
      aria-labelledby="sidebarLabel"
    >
      <div class="offcanvas-header">
        <button type="button" class="btn-close" @click="close" aria-label="Close" style="margin-top: 14px;"></button>
      </div>
      <div class="offcanvas-body">
        <!-- Using keep-alive to cache dynamic components -->
        <keep-alive>
          <component :is="current ? current.component : ''" />
        </keep-alive>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DataFilterContainer from "@render/components/DataFilterContainer.vue";
import HistoryViewer from "@render/components/HistoryViewer.vue";

interface SidebarItem {
  name: string;
  icon: [string, string];
  component: string;
  align: string;
  isVisible: () => boolean;
}

export default defineComponent({
  name: "Sidebar",
  components: {
    DataFilterContainer,
    HistoryViewer,
  },
  props: {
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
          icon: ["bi bi-funnel-fill", "bi bi-funnel"], // Bootstrap Icons
          component: "DataFilterContainer",
          align: "flex-start",
          isVisible: () => this.$store.state.datasets.name !== "",
        } as SidebarItem,
        {
          name: "History",
          icon: ["bi bi-clock-fill", "bi bi-clock-history"], // Bootstrap Icons
          component: "HistoryViewer",
          align: "flex-end",
          isVisible: () => true,
        } as SidebarItem,
      ],
    };
  },
  computed: {
    showItem() {
      return (item: SidebarItem) => item.isVisible();
    },
  },
  methods: {
    openItem(name: string) {
      this.current = this.items.find((i) => i.name === name);
      this.is_open = this.current !== undefined;
    },
    toggleItem(item: SidebarItem) {
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
  background-color: #ffffff;
  z-index: 1050;
}
.button-bar.right {
  right: 0;
}
.button-bar .btn {
  width: 48px;
  height: 48px;
  padding: 6px;
  cursor: pointer;
}
.offcanvas {
  padding-left: 26px; /* Add padding to the left to avoid cut-off */
  box-sizing: border-box; /* Ensure padding doesn't overflow */
  width: 300px;
  transition: transform 0.3s ease;
}
.offcanvas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 15px; 
  margin: 0;
}
.datafilter.card {
  margin-left: 10px; /* Add a small left margin to align the content */
}

.button-bar {
  margin-left: 0; /* Ensure the toggle buttons on the left are aligned */
}
.offcanvas-header .btn-close {
  margin-bottom: -30px; /* Ensure no margin below */
  margin-top: 16px; /* Adjust the top margin to control the spacing */
  position: relative;
  top: 5px; /* Fine-tune this value to pull the button closer to the title */
}

.offcanvas.show {
  transform: translateX(0);
}
.offcanvas-end {
  right: -300px;
}
</style>
