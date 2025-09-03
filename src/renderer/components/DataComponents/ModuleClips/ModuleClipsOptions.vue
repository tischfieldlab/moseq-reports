<template>
    <BContainer fluid>
        <BRow>
            <BInputGroup prepend="Video stream">
                <BFormSelect v-model="stream" :options="streamOptions" />
            </BInputGroup>
        </BRow>

        <BRow>
            <BInputGroup prepend="Only syllable subclip">
                <BInputGroupText>
                    <BFormCheckbox v-model="onlySubclip" switch />
                </BInputGroupText>
            </BInputGroup>
        </BRow>

        <BRow>
            <BInputGroup prepend="Loop playback">
                <BInputGroupText>
                    <BFormCheckbox v-model="loop" switch />
                </BInputGroupText>
            </BInputGroup>
        </BRow>

        <BRow>
            <BInputGroup prepend="Playback rate">
                <BFormInput v-model="playbackRate" type="number" :number="true" min="0" max="10" step="0.1" />
                <div class="figure-caption">
                    A value of 1.0 results in normal playback speed. Values &gt; 1.0 result in faster playback, and
                    values &gt; 0 and &lt; 1.0 result in slower playback.
                </div>
            </BInputGroup>
        </BRow>
    </BContainer>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";
import { ModuleClipsSettings } from "./ModuleClips.types";
import { useDatasetsStore } from "@render/store/datasets.store";

const datasetsStore = useDatasetsStore();

const props = defineProps<{ id: string }>();
const { settings, $wstate } = useWindowMixin<ModuleClipsSettings>(props.id);

const streamOptions = computed(() => {
    const run_args = (datasetsStore.manifest?.syllable_clips as any)?.args?.streams;
    if (run_args && Array.isArray(run_args) && run_args.length > 0) {
        const options = <{ text: string; value: string }[]>[];
        if (run_args.includes("ir")) {
            options.push({ text: "IR", value: "ir" });
        }
        if (run_args.includes("rgb")) {
            options.push({ text: "RGB", value: "rgb" });
        }
        if (run_args.includes("depth")) {
            options.push({ text: "Depth", value: "depth" });
        }
        if (run_args.includes("composed")) {
            options.push({ text: "Composed", value: "composed" });
        }
        return options;
    } else {
        return [
            { text: "RGB", value: "rgb" },
            { text: "Depth", value: "depth" },
            { text: "Composed", value: "composed" },
        ];
    }
});

const updateSetting = (key: string, value: any) => {
    $wstate.updateComponentSettings({
        settings: { [key]: value },
    });
};

const stream = computed({
    get: () => settings.value.stream,
    set: (val: string) => updateSetting("stream", val),
});

const onlySubclip = computed({
    get: () => settings.value.only_subclip,
    set: (val: boolean) => updateSetting("only_subclip", val),
});

const loop = computed({
    get: () => settings.value.loop,
    set: (val: boolean) => updateSetting("loop", val),
});

const playbackRate = computed({
    get: () => settings.value.playback_rate,
    set: (val: number) => updateSetting("playback_rate", val),
});

if (!streamOptions.value.find((v) => v.value == stream.value)) {
    stream.value = streamOptions.value[0].value;
}
</script>

<style scoped>
.row {
    margin: 10px 0;
}
</style>
