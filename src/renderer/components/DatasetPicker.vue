<template>
    <BFormSelect v-model="value" :options="options"></BFormSelect>
</template>

<script setup lang="ts">
import { useDataViewStore } from "@render/store/dataview.store";
import { useDataWindowStore } from "@store/datawindow.store";
import { computed } from "vue";

const props = defineProps({
    dataview: {
        type: String,
        required: true,
    },
    filters: {
        type: Function,
        default: (item: any) => true, 
    },
    owner: {
        type: String,
        default: "",
    },
});


const value = defineModel({
    type: String,
});

const options = computed((): { text: string; value: string }[] => {
    const dataviewStore = useDataViewStore(props.dataview);
    return Object.entries(dataviewStore.views)
        .map(([key, dset]) => {
            const parts = key.split("/");
            const win = useDataWindowStore(parts[0]);
            if (win && props.owner && props.owner !== parts[0]) {
                return {
                    window: win,
                    text: `${win.title}: ${parts[1]}`,
                    value: key,
                };
            }
            return undefined;
        })
        .filter((item) => item !== undefined) 
        .filter(props.filters as (item: any) => boolean); 
});
/*
function onInput(newValue: string) {
    emit("update:value", newValue);
}*/
</script>

<style scoped></style>
