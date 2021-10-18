<template>
    <div class="container">
        <div v-show="video_loaded" class="video-label-wrapper">
            <div class="info">
                <slot name="prepend"></slot>
                <span>
                    {{current_time.toFixed(2)}} / {{duration.toFixed(2)}} s
                </span>
                <span v-show="playbackRate !== 1.0">
                    {{playbackRate}}x
                </span>
            </div>
            <video ref="video"
                :id="$id('video')"
                crossOrigin='anonymous'
                :src="videoPath"
                type="video/mp4"
                controls="true"
                autoplay="true"
                muted="true"
            />
            <slot name="append"></slot>
        </div>
        <div v-show="!video_loaded" class="no-syllable">
            <slot name="no-video"></slot>
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
        playbackRate: {
            type: Number,
            required: true,
            default: undefined
        },
        loopVideo: {
            type: Boolean,
            required: false,
            default: true
        },
        subClip: {
            required: false,
            default: undefined
        },
    },
    data() {
        return {
            video_loaded: true,
            duration: 0,
            current_time: 0,
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
        video.removeEventListener('ended', this.videoEnded);
    },
    methods: {
        show_video(ev: Event) {
            const video = this.$refs.video as HTMLVideoElement;
            this.video_loaded = true;
            this.duration = (this.$refs.video as HTMLVideoElement).duration;
            if (this.subClip) {
                video.currentTime = this.subClip![0];
            }

            this.updateVideoPlaybackRate();
            this.updateVideoLooping();
            this.sizeCalculated();
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
            if (this.loopVideo) {
                if (this.subClip) {
                    if (video.currentTime > this.subClip![1]) {
                        video.currentTime = this.subClip![0];
                    }
                } else {
                    if (video.currentTime >= video.duration) {
                        video.currentTime = 0;
                    }
                }
            }
            this.current_time =  video.currentTime;
        },
        videoEnded() {
            const video = (this.$refs.video as HTMLVideoElement);
            if (this.loopVideo) {
                if (this.subClip) {
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
        sizeCalculated() {
            const video = (this.$refs.video as HTMLVideoElement);
            this.$emit('sizeCalculated', { width: video.videoWidth, height: video.videoHeight });
        }
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
    background-color: black;
    max-width: none;
    overflow: hidden;
    width: inherit;
    height: inherit;
}
video {
    width: 100%;
    height: 100%;
    /* object-fit: cover; */
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
    font-size: 14px;
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
.video-label-wrapper {
    width: 100%;
    height: inherit;
}
</style>