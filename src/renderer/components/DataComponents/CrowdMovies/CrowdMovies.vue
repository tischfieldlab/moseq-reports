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
import { defineComponent, computed } from "vue";
import RegisterDataComponent from "@render/components/Core";
import { CountMethod } from "@render/store/dataview.types";
import WindowMixin from "@render/components/Core/Window/WindowMixin";
import { GetAddress } from "@render/components/Core/DataLoader/DataServer";
import { RenderMode } from "@render/store/datawindow.types";
import VideoClips from "@render/components/Charts/VideoPlayer/VideoPlayer.vue";

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

export default defineComponent({
  name: "CrowdMovies",
  components: {
    VideoClips,
  },
  mixins: [WindowMixin],
  computed: {
    selected_syllable(): number {
      console.log("crowd movies sellected syllable:",this.dataview.selectedSyllable)
      return this.dataview.selectedSyllable;
    },
    count_method(): CountMethod {
      return this.dataview.countMethod;
    },
    crowd_movie_path(): string {
      const uID = this.$store.getters[`${this.datasource}/selectedSyllableAs`](CountMethod.Usage);
      const rID = this.$store.getters[`${this.datasource}/selectedSyllableAs`](CountMethod.Raw);
      const fname = `syllable_sorted-id-${uID} (usage)_original-id-${rID}.mp4`;
      console.log("Crowd movies:",fname)
      return `http://${GetAddress()}/crowd_movies/${fname}`;
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
</script>

<style scoped></style>
