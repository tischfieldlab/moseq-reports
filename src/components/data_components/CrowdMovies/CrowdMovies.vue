<template>
    <div class="container">
        <div v-show="video_loaded">
            <div class="info">
                <span>
                    Module {{selected_syllable}} ({{count_method}})
                </span>
                <span>
                    {{current_time.toFixed(2)}} / {{duration.toFixed(2)}} s
                </span>
                <span v-show="settings.playback_rate !== 1.0">
                    {{settings.playback_rate}}x
                </span>
            </div>
            <video ref="video" crossOrigin='anonymous'
                :src="crowd_movie_path"
                type="video/mp4"
                controls="true"
                autoplay="true"
                muted="true" />
        </div>
        <div v-show="!video_loaded" class="no-syllable">
            <b-card bg-variant="primary" text-variant="white" class="text-center">
                <b-card-text>
                    Sorry, there is no crowd movie available for Syllable {{selected_syllable}} ({{count_method}}) 
                </b-card-text>
            </b-card>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/Core';
import { CountMethod } from '@/store/dataview.types';
import mixins from 'vue-typed-mixins';
import WindowMixin from '@/components/Core/WindowMixin';
import { GetAddress } from '@/components/Core/DataLoader/DataServer';
import { RenderMode } from '@/store/datawindow.types';

RegisterDataComponent({
    friendly_name: 'Crowd Movies',
    component_type: 'CrowdMovies',
    init_width: 330,
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
    data() {
        return {
            video_loaded: true,
            size_detected: false,
            current_time: 0,
            duration: 0,
        };
    },
    mounted() {
        const video = (this.$refs.video as HTMLMediaElement);
        video.addEventListener('error', this.hide_video);
        video.addEventListener('loadedmetadata', this.show_video);
        video.addEventListener('timeupdate', this.updateCurrentTime);
    },
    beforeDestroy() {
        const video = (this.$refs.video as HTMLMediaElement);
        video.removeEventListener('error', this.hide_video);
        video.removeEventListener('loadedmetadata', this.show_video);
        video.removeEventListener('timeupdate', this.updateCurrentTime);
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
    watch: {
        'layout': {
            handler(val, oldVal) {
                this.updateVideoSize();
            },
            deep: true,
        },
        'settings.playback_rate': 'updateVideoPlaybackRate',
        'settings.loop': 'updateVideoLooping',
    },
    methods: {
        show_video(ev: Event) {
            this.video_loaded = true;
            this.duration = (this.$refs.video as HTMLVideoElement).duration;
            this.updateVideoPlaybackRate();
            this.updateVideoLooping();
            if (!this.size_detected) {
                this.updateVideoSize();
            }
        },
        hide_video(ev: Event) {
            this.video_loaded = false;
        },
        updateVideoSize() {
            const video = (this.$refs.video as HTMLVideoElement);
            const videoRatio = video.videoHeight / video.videoWidth;
            const windowRatio = this.layout.height / this.layout.width;

            if (Number.isNaN(videoRatio)) {
                video.width = this.layout.width;
                return;
            }
            this.size_detected = true;

            if (windowRatio < videoRatio) {
                if (this.layout.height > 50) { /* smallest video height */
                    video.height = this.layout.height - 32;
                } else {
                    video.height = 50;
                }
                video.width = video.height / videoRatio;
            } else {
                video.width = this.layout.width;
                video.height = video.width * videoRatio;
            }
        },
        updateVideoPlaybackRate() {
            const video = (this.$refs.video as HTMLVideoElement);
            video.playbackRate = this.settings.playback_rate;
        },
        updateVideoLooping() {
            const video = (this.$refs.video as HTMLVideoElement);
            video.loop = this.settings.loop;
        },
        updateCurrentTime() {
            const video = (this.$refs.video as HTMLVideoElement);
            this.current_time =  video.currentTime;
        },
    },
});
</script>

<style scoped>
.container {
    padding: 0;
    background-color: #00007F;
    max-width: none;
    overflow: hidden;
}
video {
    margin:0;
    padding:0;
}
video:focus {
    outline: none;
}
.info {
    position: absolute;
    color: #ffffff;
    right: 0;
    padding: 6px 6px 0 0;
    text-align: right;
}
.info span {
    display: block;
}
.no-syllable .card {
    width: 75%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>
