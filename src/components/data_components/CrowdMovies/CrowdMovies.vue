<template>
    <video-clips
        :videoPath="this.crowd_movie_path"
        :selectedSyllable="this.selected_syllable"
        :playbackRate="this.settings.playback_rate"
        :countMethod="this.count_method"
        @aspectRatioCalculated="this.aspectRatioCalculated"
    />
</template>

<script lang="ts">
import RegisterDataComponent from '@/components/Core';
import { CountMethod } from '@/store/dataview.types';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/Window/WindowMixin';
import { GetAddress } from '@/components/Core/DataLoader/DataServer';
import { RenderMode } from '@/store/datawindow.types';
import VideoClips from '../VideoClips/VideoClips.vue';

RegisterDataComponent({
    friendly_name: 'Crowd Movies',
    component_type: 'CrowdMovies',
    init_width: 360,
    init_height: 360,
    settings_type: 'CrowdMoviesOptions',
    available_render_modes: [RenderMode.VIDEO],
    default_render_mode: RenderMode.VIDEO,
    default_settings: {
        loop: true,
        playback_rate: 1.0,
    },
});

export default mixins(WindowMixin).extend({
    components: {
        VideoClips
    },
    computed: {
        selected_syllable(): number {
            return this.dataview.selectedSyllable;
        },
        count_method(): CountMethod {
            return this.dataview.countMethod;
        },
        crowd_movie_path(): string {
            const uID = this.$store.getters[`${this.datasource}/selectedSyllableAs`](CountMethod.Usage);
            const rID = this.$store.getters[`${this.datasource}/selectedSyllableAs`](CountMethod.Raw);
            const fname = `syllable_sorted-id-${uID} (usage)_original-id-${rID}.mp4`;
            return `http://${GetAddress()}/crowd_movies/${fname}`;
        },
    },
    methods: {
        aspectRatioCalculated(payload: { aspectRatio: number }) {
            this.$store.commit(`${this.id}/updateAspectRatio`, { aspect_ratio: payload.aspectRatio });
        }
    }
});
</script>

<style scoped>
</style>
