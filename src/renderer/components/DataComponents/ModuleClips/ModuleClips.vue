<template>
  <div class="video-container">
    <b-pagination
      v-if="num_examples > 0"
      v-model="example_num"
      :total-rows="num_examples"
      :per-page="1"
      :limit="num_examples"
      :aria-controls="$id('video')"
      align="fill"
      :hide-goto-end-buttons="true"
      size="sm"
    />
    <video-clips
      :videoPath="this.movie_path"
      :playbackRate="this.settings.playback_rate"
      :loopVideo="this.settings.loop"
      :subClip="this.settings.only_subclip ? this.subclip : undefined"
      @sizeCalculated="this.sizeCalculated"
    >
      <template slot="prepend">
        <span> Module {{ selected_syllable }} ({{ count_method }}) </span>
      </template>
      <template slot="no-video">
        <b-card bg-variant="primary" text-variant="white" class="text-center">
          <b-card-text>
            Sorry, there is no crowd movie available for Syllable {{ selected_syllable }} ({{ count_method }})
          </b-card-text>
        </b-card>
      </template>
    </video-clips>
  </div>
</template>

<script lang="ts">
import RegisterDataComponent from "@render/components/Core";
import { CountMethod } from "@render/store/dataview.types";
import mixins from "vue-typed-mixins";
import WindowMixin from "@render/components/Core/Window/WindowMixin";
import { GetAddress } from "@render/components/Core/DataLoader/DataServer";
import { RenderMode } from "@render/store/datawindow.types";
import VideoClips from "@render/components/Charts/VideoPlayer/VideoPlayer.vue";

RegisterDataComponent({
  friendly_name: "Module Clips",
  component_type: "ModuleClips",
  init_width: 360,
  init_height: 360,
  settings_type: "ModuleClipsOptions",
  available_render_modes: [RenderMode.VIDEO],
  default_render_mode: RenderMode.VIDEO,
  default_settings: {
    stream: "rgb",
    loop: true,
    playback_rate: 1.0,
    only_subclip: true,
  },
});

export default mixins(WindowMixin).extend({
  components: {
    VideoClips,
  },
  data() {
    return {
      example_num: 1,
    };
  },
  computed: {
    selected_syllable(): number {
      return this.dataview.selectedSyllable;
    },
    count_method(): CountMethod {
      return this.dataview.countMethod;
    },
    // returns moduleclips if changes occur to the dataset.
    items(): any[] {
      const ids = this.$store.getters[`${this.datasource}/selectedSyllableMap`];
      if (this.$store.state.datasets.manifest.hasOwnProperty("syllable_clips")) {
        const items = this.$store.state.datasets.manifest.syllable_clips.manifest.filter((row) => {
          return row.sid_raw === ids.raw;
        });
        return items;
      }
      return [];
    },
    args(): any {
      return this.$store.state.datasets.manifest.syllable_clips.args;
    },
    current_item(): any {
      return this.items[this.example_num - 1];
    },
    num_examples(): number {
      return this.items.length;
    },
    // returns particular subclip in Module clips if `this.current_item` is changed.
    subclip(): [number, number] {
      const item = this.current_item;
      const cStart = this.timeToSeconds(item.start_time);
      const cStop = this.timeToSeconds(item.end_time);
      const sStart = this.timeToSeconds(item.onset_time);
      const sStop = this.timeToSeconds(item.offset_time);
      return [sStart - cStart, sStop - cStart];
    },
    // returns address of current moduleclips if change occurs to the selected item.
    movie_path(): string {
      const item = this.current_item;
      if (item) {
        const base = item.base_name.replace("\\", "/");
        return `http://${GetAddress()}/${base}.${this.settings.stream}.mp4`;
      }
      return "";
    },
  },
  methods: {
    // Updates current value of `example_num` through onclick in layout event.
    onExampleClick(event) {
      this.example_num = event;
    },
    // Decreases value of `example_num` to change video.
    onPrevExampleClick() {
      if (this.example_num === 0) {
        this.example_num = this.num_examples - 1;
        return;
      }
      this.example_num--;
    },
    // Increases value of `example_num` to change video.
    onNextExampleClick() {
      if (this.example_num === this.num_examples - 1) {
        this.example_num = 0;
        return;
      }
      this.example_num++;
    },
    timeToSeconds(time: string) {
      return time.split(":").reduce((acc, t) => 60 * acc + Number.parseFloat(t), 0);
    },
    sizeCalculated(payload: { width: number; height: number }) {
      const { width, height } = payload;

      let aspectRatio: number = this.layout.width / this.layout.height;
      const newHeight: number = height + 10 * aspectRatio;

      aspectRatio = width / newHeight;

      this.$store.commit(`${this.id}/updateAspectRatio`, { aspect_ratio: aspectRatio });
    },
  },
});
</script>

<style scoped>
.video-container {
  height: calc(100% - 10px);
}
.b-pagination {
  margin-bottom: 0;
}
</style>
