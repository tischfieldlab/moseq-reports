<template>
    <BFormSelect :modelValue="value" @update:modelValue="onInput" :options="options"></BFormSelect>
</template>

<script lang="ts">
import { useWindowsStore } from "@store/windows.store";
import { useDataWindowStore } from "@store/datawindow.store";
import { defineComponent, computed } from "vue";

export default defineComponent({
    props: {
        value: {
            type: String,
            required: true,
        },
        dataview: {
            type: Object, 
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
    },
    setup(props) {
        const windowsStore = useWindowsStore();

        const options = computed((): { text: string; value: string }[] => {
            return Object.entries(props.dataview.views)
                .map(([key, dset]) => {
                    const parts = key.split("/");
                    const win = useDataWindowStore(parts[1]);
                    if (win && props.owner && props.owner !== parts[1]) {
                        return {
                            window: win,
                            text: `${win.title}: ${parts[2]}`,
                            value: key,
                        };
                    }
                    return undefined;
                })
                .filter((item) => item !== undefined) 
                .filter(props.filters as (item: any) => boolean); 
        });

        return {
            options,
        };
    },
    methods: {
        onInput(newValue: string) {
            this.$emit("update:value", newValue);
        },
    },
});
</script>

<style scoped></style>
