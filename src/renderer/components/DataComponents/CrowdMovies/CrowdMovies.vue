<template>
  <video-clips
    :videoPath="crowd_movie_path"
    :playbackRate="settings.playback_rate"
    :loopVideo="settings.loop"
    @sizeCalculated="sizeCalculated"
  >
    <template #prepend>
      <span> Module {{ selected_syllable }} ({{ count_method }}) </span>
    </template>
    <template #no-video>
      <b-card bg-variant="primary" text-variant="white" class="text-center">
        <b-card-text>
          Sorry, there is no crowd movie available for Syllable {{ selected_syllable }} ({{ count_method }}).
        </b-card-text>
      </b-card>
    </template>
  </video-clips>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from "vue";
import RegisterDataComponent from "@render/components/Core";
import { CountMethod } from "@render/store/dataview.types";
import WindowMixin from "@render/components/Core/Window/WindowMixin";
import axios from "axios"; // Axios for making HTTP requests
import { RenderMode } from "@render/store/datawindow.types";
import VideoClips from "@render/components/Charts/VideoPlayer/VideoPlayer.vue";
import { useStore } from "vuex";
import { ipcRenderer, IpcRendererEvent } from 'electron';

export default defineComponent({
  name: "CrowdMovies",
  components: {
    VideoClips,
  },
  mixins: [WindowMixin],
  setup() {
    const store = useStore();
    const crowd_movie_path = ref<string>("");
    const errorMessage = ref<string>("");

    /**
     * Fetch the data server address and construct the movie path.
     */
    const fetchMoviePath = async () => {
      try {
        //const uID = this.$store.getters[`${this.datasource}/selectedSyllableAs`](CountMethod.Usage);
        //const rID = this.$store.getters[`${this.datasource}/selectedSyllableAs`](CountMethod.Raw);
        //const fname = `syllable_sorted-id-${uID} (usage)_original-id-${rID}.mp4`;
      
        const serverAddress = await ipcRenderer.invoke("get-data-server-address");
        if (!serverAddress) {
          throw new Error("Failed to retrieve DataServer address.");
        }
        const fname = `syllable_sorted-id-0 (usage)_original-id-48.mp4`

        crowd_movie_path.value = `${serverAddress}/crowd_movies/${encodeURIComponent(fname)}`;
        console.log("Crowd movie path set to:", crowd_movie_path.value);
      } catch (error) {
        console.error("Error fetching movie path:", error);
        errorMessage.value = "Unable to fetch the movie path.";
      }
    };
    //crowd_movie_path.value = 'C:\Users\karth\Desktop\Abraria Lab/2022-07-18_Meloxicam_rOT_model_1000-15.msq\crowd_movies\syllable_sorted-id-0 (usage)_original-id-48.mp4';
    onMounted(() => {
      fetchMoviePath();
    });
    return {
      crowd_movie_path,
      errorMessage,
    };
  },
  computed: {
    selected_syllable(): number {
      console.log("CrowdMovies selected syllable:", this.dataview.selectedSyllable);
      return this.dataview.selectedSyllable;
    },
    count_method(): CountMethod {
      return this.dataview.countMethod;
    },
  },
  methods: {
    sizeCalculated(payload: { width: number; height: number }) {
      const { width, height } = payload;
      const aspectRatio: number = width / height;

      this.$store.commit(`${this.id}/updateAspectRatio`, { aspect_ratio: aspectRatio });
    },
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

<style scoped></style>
