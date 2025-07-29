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
                <BButton variant="link" size="lg" @click="toggleItem(itm)" :class="{ active: current === itm }">
                    <i :class="current === itm ? itm.icon[0] : itm.icon[1]"></i>
                </BButton>
            </div>
        </div>

        <!-- Sidebar -->
        <BOffcanvas
            v-model="is_open"
            :placement="placement"
            :no-header="true"
            :no-backdrop="true"
            shadow="lg"
            :width="300"
        >
            <keep-alive>
                <component :is="current?.component" />
            </keep-alive>
        </BOffcanvas>
    </Teleport>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import DataFilterContainer from "@render/components/DataFilterContainer.vue";
import HistoryViewer from "@render/components/HistoryViewer.vue";
import {useDatasetsStore} from "@store/datasets.store"



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
        const datasetsStore = useDatasetsStore();
        return {
            is_open: false,
            current: undefined as SidebarItem|undefined,
            items:  [{
                name: "Data Filters",
                icon: ["bi bi-funnel-fill", "bi bi-funnel"],
                component: "DataFilterContainer",
                align: "flex-start",
                isVisible: () => datasetsStore.name !== "",
            } as SidebarItem,
            {
                name: "History",
                icon: ["bi bi-clock-fill", "bi bi-clock-history"],
                component: "HistoryViewer",
                align: "flex-end",
                isVisible: () => true,
            } as SidebarItem,],
        };
    },
    computed: {
        showItem() {
            return (item: SidebarItem) => item.isVisible();
        },
        placement() {
            return this.right ? "end" : "start";
        },
    },
    methods: {
        openItem(name: string) {
            this.current = this.items.find((itm) => itm.name === name);
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
<style>
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
    margin-left: 0;
}
.button-bar.right {
    right: 0;
}
.button-bar .btn {
    width: 48px;
    height: 48px;
    padding: 6px;
    cursor: pointer;
    border-radius: 0;
    color: #2c3e50 !important; /* Change color of active button */
}
.button-bar .btn.active {
    border-left: 4px solid #2c3e50 !important; /* Highlight active button */
}
.button-bar.right .btn.active {
    border-right: 4px solid #2c3e50 !important; /* Highlight active button */
    border-left: none !important; /* Remove left border for right sidebar */
}

.offcanvas {
    width: 335px !important;
    margin-top: 30px;
}
.offcanvas.offcanvas-start {
    left: 48px !important;
}
.offcanvas.offcanvas-end {
    right: 48px !important;
}
.offcanvas-body {
    padding-left: 0 !important;
    padding-right: 0 !important;
    background-color: #f8f9fa !important;
}




</style>