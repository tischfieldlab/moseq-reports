<template>
    <video-clips
        :videoPath="this.crowd_movie_path"
        :playbackRate="this.settings.playback_rate"
        :loopVideo="this.settings.loop"
        @sizeCalculated="this.sizeCalculated"
    >
        <template slot="prepend">
            <span> Module {{ selected_syllable }} ({{ count_method }}) </span>
        </template>
        <template slot="no-video">
            <b-card
                bg-variant="primary"
                text-variant="white"
                class="text-center"
            >
                <b-card-text>
                    Sorry, there is no crowd movie available for Syllable
                    {{ selected_syllable }} ({{ count_method }})
                </b-card-text>
            </b-card>
        </template>
    </video-clips>
</template>

<script lang="ts">
import RegisterDataComponent from "../../../components/Core";
import { CountMethod } from "../../../store/dataview.types";
import mixins from "vue-typed-mixins";
import WindowMixin from "../../../components/Core/Window/WindowMixin";
import { GetAddress } from "../../../components/Core/DataLoader/DataServer";
import { RenderMode } from "../../../store/datawindow.types";
import VideoClips from "../../Charts/VideoPlayer/VideoPlayer.vue";

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

export default mixins(WindowMixin).extend({
    components: {
        VideoClips,
    },
    computed: {
        selected_syllable(): number {
            return this.dataview.selectedSyllable;
        },
        count_method(): CountMethod {
            return this.dataview.countMethod;
        },
        crowd_movie_path(): string {
            const uID = this.$store.getters[
                `${this.datasource}/selectedSyllableAs`
            ](CountMethod.Usage);
            const rID = this.$store.getters[
                `${this.datasource}/selectedSyllableAs`
            ](CountMethod.Raw);
            const fname = `syllable_sorted-id-${uID} (usage)_original-id-${rID}.mp4`;
            return `http://${GetAddress()}/crowd_movies/${fname}`;
        },
    },
    methods: {
        sizeCalculated(payload: { width: number; height: number }) {
            const { width, height } = payload;
            const aspectRatio: number = width / height;

            this.$store.commit(`${this.id}/updateAspectRatio`, {
                aspect_ratio: aspectRatio,
            });
        },
    },
});
</script>

<style scoped></style>
