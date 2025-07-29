<template>
    <BContainer fluid>
        <BRow>
            <!-- Loop Playback -->
            <BInputGroup prepend="Loop playback">
                <BInputGroupText>
                    <BFormCheckbox v-model="loop" switch class="me-n2"></BFormCheckbox>
                </BInputGroupText>
            </BInputGroup>
        </BRow>
        <BRow>
            <!-- Playback Rate -->
            <BInputGroup prepend="Playback rate">
                <BFormInput
                    v-model="playback_rate"
                    type="number"
                    min="0.0"
                    max="16"
                    step="0.1"
                />
                <div class="figure-caption mt-2">
                    A value of 1.0 results in normal playback speed. Values &gt; 1.0 result
                    in faster playback, and values &gt; 0 & &lt; 1.0 result in slower
                    playback.
                    <br />
                    Playback rate limits: Minimum 0.0165, Maximum 16.
                </div>
            </BInputGroup>
        </BRow>
    </BContainer>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";

export default defineComponent({
    name: "PlaybackSettings",
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const { $wstate, settings } = useWindowMixin<CrowdMoviesOptions>(props.id);

        // Computed property for loop
        const loop = computed({
            get: () => settings.value.loop, // Default to true if not defined
            set: (value: boolean) => {
                $wstate.updateComponentSettings({
                    settings: { loop: value }, // Merge existing settings with the new loop value
                });
            },
        });

        const playback_rate = computed({
            get: () => settings.value.playback_rate, // Default to true if not defined
            set: (value: number) => {
                const clampedRate = Math.min(16, Math.max(0.01, value)); // Enforce limits
                $wstate.updateComponentSettings({
                    settings: { playback_rate: clampedRate }, // Merge existing settings with the new loop value
                });
            },
        });

        return {
            loop,
            playback_rate,
        };
    },
});
</script>

<style scoped>
.row {
    margin: 10px 0;
}

.figure-caption {
    font-size: 0.875rem;
    color: #6c757d;
}
</style>
