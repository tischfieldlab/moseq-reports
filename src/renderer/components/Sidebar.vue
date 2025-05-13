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
                <BButton class="btn-link" @click="toggleItem(itm)">
                    <i :class="current === itm ? itm.icon[0] : itm.icon[1]"></i>
                </BButton>
            </div>
        </div>

        <!-- Sidebar -->
        <div
            class="offcanvas"
            :class="{ 'offcanvas-end': right, 'offcanvas-start': !right, show: is_open }"
            tabindex="-1"
            id="sidebar"
            aria-labelledby="sidebarLabel"
        >
            <div class="offcanvas-header">
                <!--<BButton type="button" class="btn-close" @click="close" aria-label="Close"></BButton>-->
            </div>
            <div class="offcanvas-body">
                <keep-alive>
                    <component :is="current?.component" />
                </keep-alive>
            </div>
        </div>
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
    margin-left: 10px; 
}

.button-bar {
    margin-left: 0; 
}
.offcanvas-header .btn-close {
    margin-bottom: -30px; 
    margin-top: 16px; 
    position: relative;
    top: 5px;
}

.offcanvas.show {
    transform: translateX(0);
}
.offcanvas-end {
    right: -300px;
}
</style>