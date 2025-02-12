<template>
  <b-container fluid>
    <b-row>
      <!-- Loop Playback -->
      <BInputGroup prepend="Loop playback">
        <BInputGroupText>
        <BFormCheckbox v-model="loop" switch class="me-n2"></BFormCheckbox>
      </BInputGroupText>
      </BInputGroup>
    </b-row>
    <b-row>
    <!-- Playback Rate -->
    <BInputGroup prepend="Playback rate">
        <BFormInput
          v-model="playbackRateInput"
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
  </b-row>
  </b-container>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import { useStore } from "vuex";
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
    const store = useStore();
    const id = props.id; // Replace with dynamic ID if necessary
    const { datasource, dataview, $wstate } = useWindowMixin(props.id);

    // Get settings from mixin or provide defaults
    const settings = computed(
      () =>
        $wstate.value.settings as { playback_rate: number; loop: boolean } || {
          playback_rate: 1.0,
          loop: true,
        }
    );

    // Computed property for loop
    const loop = computed({
      get: () => settings.value?.loop ?? true, // Default to true if not defined
      set: (value: boolean) => {
        store.commit(`${props.id}/updateComponentSettings`, {
          id: props.id,
          settings: { ...settings.value, loop: value }, // Merge existing settings with the new loop value
        });
      },
    });

    // Local reactive reference for playback rate input
    const playbackRateInput = ref<number | null>(settings.value?.playback_rate ?? 1.0);

    // Watch for changes in playbackRateInput and enforce limits
    watch(playbackRateInput, (newRate) => {
      if (newRate === null || newRate === undefined) {
        // Allow blank during editing
        return;
      }

      const clampedRate = Math.min(16, Math.max(0.01, newRate)); // Enforce limits
      if (clampedRate !== newRate) {
        playbackRateInput.value = clampedRate; // Reset to limit if outside range
      }

      // Update Vuex store with the validated value
      store.commit(`${props.id}/updateComponentSettings`, {
        id: props.id,
        settings: { ...settings.value, playback_rate: clampedRate },
      });
    });

    return {
      loop,
      playbackRateInput,
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
