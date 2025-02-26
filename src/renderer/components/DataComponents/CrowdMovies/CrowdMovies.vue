<template>
  <video-clips
    :videoPath="crowdMoviePath"
    :playbackRate="settings.playback_rate"
    :loopVideo="settings.loop"
    @sizeCalculated="sizeCalculated"
  >
    <template #prepend>
      <span> Module {{ selected_syllable }} ({{ count_method }}) </span>
    </template>
    <template #no-video>
      <BCard bg-variant="primary" text-variant="white" class="text-center">
        <BCardText>
          Sorry, there is no crowd movie available for Syllable {{ selected_syllable }} ({{ count_method }}).
        </BCardText>
      </BCard>
    </template>
  </video-clips>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import RegisterDataComponent from "@render/components/Core";
import { CountMethod } from "@render/store/dataview.types";
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";
import VideoClips from "@render/components/Charts/VideoPlayer/VideoPlayer.vue";
import { useStore } from "vuex";
import { RenderMode } from "@render/store/datawindow.types";

export default defineComponent({
  name: "CrowdMovies",
  components: {
    VideoClips,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { datasource, dataview, $wstate} = useWindowMixin(props.id);

    // Reactive references
    const crowdMoviePath = ref<string>("");
    const errorMessage = ref<string>("");
    const aspectRatio = ref<number>(0);
    const uID = computed(() => {
      if (!datasource.value) return null;
      return store.getters[`${datasource.value}/selectedSyllableAs`](CountMethod.Usage);
    });

    const rID = computed(() => {
      if (!datasource.value) return null;
      return store.getters[`${datasource.value}/selectedSyllableAs`](CountMethod.Raw);
    });

    const fname = computed(() => {
      return `syllable_sorted-id-${uID.value} (usage)_original-id-${rID.value}.mp4`;
    });

    const serverAddress = computed(() => store.getters["server/getServerAddress"]);
    const selected_syllable = computed(() => dataview.value.selectedSyllable);
    const count_method = computed(() => dataview.value.countMethod);
    const settings = computed(() => $wstate.value.settings as { playback_rate: number; loop: boolean }|| { playback_rate: 1.0, loop: true });
    const fetchMoviePath = async () => {
      try {
        if (!serverAddress.value) {
          throw new Error("Server address is not available.");
        }
        crowdMoviePath.value = `${serverAddress.value}/crowd_movies/${encodeURIComponent(fname.value)}`;
        console.log("Crowd movie path set to:", crowdMoviePath.value);
      } catch (error) {
        console.error("Error fetching movie path:", error);
        errorMessage.value = "Unable to fetch the movie path.";
      }
    };

    const sizeCalculated = (payload: { width: number; height: number }) => {
      const { width, height } = payload;
      aspectRatio.value = width / height;

      store.commit(`${props.id}/updateAspectRatio`, {
        aspect_ratio: aspectRatio.value,
      });
    };

    onMounted(() => {
      fetchMoviePath();
    });

    watch([uID, rID, serverAddress], fetchMoviePath, { immediate: true });

    return {
      crowdMoviePath,
      errorMessage,
      settings,
      aspectRatio,
      fname,
      uID,
      rID,
      selected_syllable,
      count_method,
      sizeCalculated,
    };
  },
});

RegisterDataComponent({
  friendly_name: "Crowd Movies",
  component_type: "CrowdMovies",
  init_width: 360,
  init_height: 360,
  settings_type: "CrowdMoviesOptions",
  available_render_modes: [RenderMode.VIDEO],
  default_render_mode: RenderMode.VIDEO,
  default_settings: {
    loop: true,
    playback_rate: 1.0,
  },
});
</script>

