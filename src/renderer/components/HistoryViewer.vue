<template>
  <div class="sidebar-container">
    <h3>Notification History</h3>
    <template v-if="items.length > 0">
      <div v-for="(itm, idx) in items" :key="idx" class="toast show mb-3" role="alert" :class="'bg-' + itm.variant">
        <div class="toast-header">
          <!--strong class="me-auto">Notification</strong-->
          <small>{{ formatTime(itm.time) }}</small>
          <button type="button" class="btn-close" aria-label="Close" @click="removeNotification(idx)"></button>
        </div>
        <div class="toast-body">
          {{ itm.message }}
          <a v-if="itm.details" href="#" @click.prevent="toggleDetails(idx)" class="details-link">
            {{ itm.showDetails ? "Hide Details" : "Show Details" }}
          </a>
          <div v-if="itm.showDetails" class="details mt-2">
            <textarea class="form-control" readonly rows="3" v-model="itm.details"></textarea>
          </div>
        </div>
      </div>
    </template>
    <div v-else>
      <p class="no-items">There doesn't seem to be anything here.</p>
    </div>
  </div>
</template>



<script lang="ts">
import { defineComponent, computed, reactive } from "vue";
import { formatDistanceToNow } from "date-fns";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore();

    const items = computed(() =>
      store.state.history.items.map((item) => ({
        ...item,
        showDetails: false, // Add a local property for toggling details
      }))
    );

    const formatTime = (datetime) => {
      return formatDistanceToNow(new Date(datetime), { addSuffix: true });
    };

    const toggleDetails = (idx) => {
      items.value[idx].showDetails = !items.value[idx].showDetails;
    };

    const removeNotification = (idx) => {
      store.commit("history/removeEntry", idx); // Update Vuex state
    };

    return {
      items,
      formatTime,
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
  padding: 12px; /* Ensure content inside the toast has padding */
  word-wrap: break-word; /* Handle long messages */
}

.toast-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toast-body {
  margin-top: 6px;
}

.notification-item {
  margin-left: 16px; /* Add consistent margin on left */
  margin-right: 16px; /* Add consistent margin on right */
}

h3 {
  text-align: center;
  margin-top: 12px;
}

.no-items {
  text-align: center;
  font-size: 14px;
  color: #a5a5a5;
  margin: 24px auto; /* Center-align and add proper margin */
  padding: 12px; /* Add padding for better spacing */
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
  box-sizing: border-box; /* Ensure proper width sizing */
}

.sidebar-container {
  padding: 16px; /* Add padding around the entire container */
  overflow-x: hidden; /* Prevent horizontal scrolling */
}
</style>
