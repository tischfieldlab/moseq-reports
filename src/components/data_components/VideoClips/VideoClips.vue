<template>
<div class="container">
        <div v-show="video_loaded">
            <div class="info">
                <span>
                    Module {{selectedSyllable}} ({{countMethod}})
                </span>
                <span>
                    {{current_time.toFixed(2)}} / {{duration.toFixed(2)}} s
                </span>
                <span v-show="playbackRate !== 1.0">
                    {{playbackRate}}x
                </span>
            </div>
            <video ref="video"
                :style="{width: `${this.video_width}px`, height: `${this.video_height}px`}"
                crossOrigin='anonymous'
                :src="videoPath"
                type="video/mp4"
                controls="true"
                autoplay="true"
                muted="true"
            />
        </div>
        <div v-show="!video_loaded" class="no-syllable">
            <b-card bg-variant="primary" text-variant="white" class="text-center">
                <b-card-text>
                    Sorry, there is no crowd movie available for Syllable {{selectedSyllable}} ({{countMethod}}) 
                </b-card-text>
            </b-card>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        videoPath: {
            type: String,
            required: true,
            default: undefined
        },
        selectedSyllable: {
            type: Number,
            required: true,
            default: 0
        },
        playbackRate: {
            type: Number,
            required: true,
            default: undefined
        },
        countMethod: {
            type: String,
            required: true,
            default: undefined
        },
        loopVideo: {
            type: Boolean,
            required: false,
            default: true
        },
        layout: {
            type: Object,
            required: true,
            default: undefined
        },
        onlySubClip: {
            type: Boolean,
            required: false,
            default: false
        },
        subClip: {
            required: false,
            default: undefined
        }
    },
    data() {
        return {
            video_loaded: true,
            duration: 0,
            current_time: 0,
        }
    },
    computed: {
        video_height(): number {
            if (this.subClip) {
                return this.layout.height - 64;
            } else {
                return this.layout.height - 34;
            }
        },
        video_width(): number {
            return this.layout.width;
        }
    },
    mounted() {
        const video = (this.$refs.video as HTMLMediaElement);
        video.addEventListener('error', this.hide_video);
        video.addEventListener('loadedmetadata', this.show_video);
        video.addEventListener('timeupdate', this.updateCurrentTime);
        video.addEventListener('ended', this.videoEnded);
    },
    beforeDestroy() {
        const video = (this.$refs.video as HTMLMediaElement);
        video.removeEventListener('error', this.hide_video);
        video.removeEventListener('loadedmetadata', this.show_video);
        video.removeEventListener('timeupdate', this.updateCurrentTime);
        video.addEventListener('ended', this.videoEnded);
    },
    methods: {
        show_video(ev: Event) {
            this.video_loaded = true;
            this.duration = (this.$refs.video as HTMLVideoElement).duration;
            this.updateVideoPlaybackRate();
            this.updateVideoLooping();
        },
        hide_video(ev: Event) {
            this.video_loaded = false;
        },
        updateVideoPlaybackRate() {
            const video = (this.$refs.video as HTMLVideoElement);
            video.playbackRate = this.playbackRate;
        },
        updateVideoLooping() {
            const video = (this.$refs.video as HTMLVideoElement);
            video.loop = this.loopVideo;
        },
        updateCurrentTime() {
            const video = (this.$refs.video as HTMLVideoElement);
            this.current_time =  video.currentTime;
        },
        videoEnded() {
            const video = (this.$refs.video as HTMLVideoElement);
            if (this.loopVideo) {
                if (this.subClip && this.subClip) {
                    if (video.currentTime > this.subClip![1]) {
                        video.currentTime = this.subClip![0];
                    }
                } else {
                    if (video.currentTime >= video.duration) {
                        video.currentTime = 0;
                    }
                }
                video.play();
            }
        },
    },
     watch: {
        'playbackRate': 'updateVideoPlaybackRate',
        'loopVideo': 'updateVideoLooping',
    },
});
</script>

<style scoped>
.container {
    padding: 0;
    background-color: #080A80;
    max-width: none;
    overflow: hidden;
}
video {
    width: 100%;
    height: 100%;
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