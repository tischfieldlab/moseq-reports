<template>
    <BContainer fluid>
        <BRow>
            <BInputGroup prepend="Video stream">
                <BFormSelect v-model="stream" :options="streamOptions" />
            </BInputGroup>
        </BRow>

        <BRow>
            <BFormCheckbox v-model="onlySubclip" switch>Only module subclip</BFormCheckbox>
        </BRow>

        <BRow>
            <BFormCheckbox v-model="loop" switch>Loop playback</BFormCheckbox>
        </BRow>

        <BRow>
            <BInputGroup prepend="Playback rate">
                <BFormInput
                    v-model="playbackRate"
                    type="number"
                    :number="true"
                    min="0"
                    max="10"
                    step="0.1"
                />
                <div class="figure-caption">
                    A value of 1.0 results in normal playback speed. Values &gt; 1.0 result in faster playback, and values &gt; 0 and &lt; 1.0 result in slower playback.
                </div>
            </BInputGroup>
        </BRow>
    </BContainer>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";

const props = defineProps<{ id: string }>();
const { settings, dataview } = useWindowMixin(props.id);

const streamOptions = ref([
    { text: "RGB", value: "rgb" },
    { text: "Depth", value: "depth" },
    { text: "Composed", value: "composed" },
]);

const updateSetting = (key: string, value: any) => {
    dataview.value.updateComponentSettings({
        id: props.id,
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
</script>

<style scoped>
.row {
  margin: 10px 0;
}
</style>
