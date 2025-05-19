<template>
    <div class="sidebar-container">
        <h3>Notification History</h3>
        <template v-if="items.length > 0">
            <b-toast v-for="(itm, idx) in items" :key="idx" :show="true" :variant="itm.variant">
                <template #title>
                    <timeago :datetime="itm.time" />
                </template>
                {{ itm.message }}
                <BLink v-if="itm.details" href="#" @click.prevent="toggleDetails(idx)" class="details-link">
                    {{ itm.showDetails ? "Hide Details" : "Show Details" }}
                </BLink>
                <div v-if="itm.showDetails" class="details mt-2">
                    <textarea class="form-control" readonly rows="3" v-model="itm.details"></textarea>
                </div>
            </b-toast>
            <!--<div v-for="(itm, idx) in items" :key="idx" class="toast show mb-3" role="alert" :class="`bg-${itm.variant}`">
                <div class="toast-header">
                    <!--strong class="me-auto">Notification</strong--><!--
                    <small><timeago :datetime="itm.time" /></small>
                    <button class="btn-close" aria-label="Close" @click="removeNotification(idx)" v-b-tooltip="'dismiss'"></button>
                </div>
                <div class="toast-body">
                    {{ itm.message }}
                    <BLink v-if="itm.details" href="#" @click.prevent="toggleDetails(idx)" class="details-link">
                        {{ itm.showDetails ? "Hide Details" : "Show Details" }}
                    </BLink>
                    <div v-if="itm.showDetails" class="details mt-2">
                        <textarea class="form-control" readonly rows="3" v-model="itm.details"></textarea>
                    </div>
                </div>
            </div>-->
        </template>
        <div v-else>
            <p class="no-items">There doesn't seem to be anything here.</p>
        </div>
    </div>
</template>



<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useHistoryStore } from "@store/history.store";

export default defineComponent({
    setup() {
        const historyStore = useHistoryStore();

        historyStore.$onAction((action) => {
            console.log("HistoryStore action triggered:", action.name);

            if (action.name === "addEntry") {
                console.log("HistoryStore action triggered:", action.name);
                action.after(() => {
                    items.value.push({
                        ...historyStore.items[historyStore.items.length - 1],
                        showDetails: false,
                    });
                });
            } else if (action.name === "removeEntry") {
                console.log("HistoryStore action triggered:", action.name);
                items.value.splice(action.args[0], 1);
            }
        });

        const items = ref(
            historyStore.items.map((item) => ({
                ...item,
                showDetails: false,
            }))
        );

        const toggleDetails = (idx) => {
            console.log("Toggling details for item at index:", idx, items.value[idx].showDetails, !items.value[idx].showDetails);
            items.value[idx].showDetails = !items.value[idx].showDetails;
            console.log("New state:", items.value[idx].showDetails);
        };

        const removeNotification = (idx) => {
            historyStore.removeEntry(idx); 
        };

        return {
            items,
            toggleDetails,
            removeNotification,
        };
    },
});
</script>
<style scoped>
.toast {
    margin: 6px;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
    word-wrap: break-word;
}

.toast-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: -1px;
}

.toast-body {
    margin-top: 6px;
}

.notification-item {
    margin-left: 16px; 
    margin-right: 16px; 
}

h3 {
    text-align: center;
    margin-top: 12px;
}

.no-items {
    text-align: center;
    font-size: 14px;
    color: #a5a5a5;
    margin: 24px auto; 
    padding: 12px;
}

.details-link {
    margin-left: 10px;
    cursor: pointer;
    color: #0d6efd;
}

.details {
    margin-top: 10px;
}

textarea {
    font-family: "Courier New", Courier, monospace;
    font-size: 12px;
    white-space: pre;
    width: 100%;
    box-sizing: border-box; 
}

.sidebar-container {
    padding: 16px; 
    overflow-x: hidden; 
}
</style>
