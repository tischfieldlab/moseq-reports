<template>
    <div>
        <template v-for="wid in windows" :key="wid">
            <UiCard :id="wid" />
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import UiCard from "@render/components/Core/Window/Window.vue";
import { useWindowsStore } from "@render/store/windows.store";

export default defineComponent({
    components: {
        UiCard,
    },
    setup() {
        const windowsStore = useWindowsStore(); 
        const windows = computed(() => {
            console.log("State items:", windowsStore.items);
            return windowsStore.items;
        });

        return {
            windows,
        };
    },
});
</script>
