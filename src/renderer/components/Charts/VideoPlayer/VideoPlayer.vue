<template>
    <div class="container">
        <div v-show="videoLoaded" class="video-label-wrapper">
            <div class="info">
                <slot name="prepend"></slot>
                <span>{{ currentTime.toFixed(2) }} / {{ duration.toFixed(2) }} s</span>
                <span v-show="playbackRate !== 1.0">{{ playbackRate }}x</span>
            </div>
            <video ref="video" :id="videoId" crossOrigin="anonymous" :src="videoPath" type="video/mp4" controls autoplay
                muted />
            <slot name="append"></slot>
        </div>
        <div v-show="!videoLoaded" class="no-syllable">
            <slot name="no-video"></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, WatchEffect, computed, onMounted, onUnmounted, watchEffect } from "vue";

export default defineComponent({
    name: "VideoClips",
    props: {
        videoPath: {
            type: String,
            required: true,
        },
        playbackRate: {
            type: Number,
            default: 1.0,
        },
        loopVideo: {
            type: Boolean,
            default: true,
        },
        subClip: {
            type: Array as unknown as () => [number, number] | undefined,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const video = ref<HTMLVideoElement | null>(null);
        const videoId = ref(`video-${Math.random().toString(36).substr(2, 9)}`);
        const videoLoaded = ref(true);
        const duration = ref(0);
        const currentTime = ref(0);
        const validatedPlaybackRate = computed(() => {
            return Math.min(Math.max(props.playbackRate, 0.1), 16.0);
        });
        const updateVideoPlaybackRate = () => {
            if (video.value) {
                video.value.playbackRate = validatedPlaybackRate.value;
            }
        };

        const updateVideoLooping = () => {
            if (video.value) {
                video.value.loop = props.loopVideo;
            }
        };

        const sizeCalculated = () => {
            if (video.value) {
                emit("sizeCalculated", {
                    width: video.value.videoWidth,
                    height: video.value.videoHeight,
                });
            }
        };

        const showVideo = () => {
            if (video.value) {
                videoLoaded.value = true;
                duration.value = video.value.duration;
                if (props.subClip) {
                    video.value.currentTime = props.subClip[0];
                }
                updateVideoPlaybackRate();
                updateVideoLooping();
                sizeCalculated();
            }
        };

        const hideVideo = () => {
            videoLoaded.value = false;
        };
        const raiseError = (error: Event) => {
            emit("error", error);
        };

        const updateCurrentTime = () => {
            if (video.value) {
                if (props.loopVideo) {
                    if (props.subClip && video.value.currentTime > props.subClip[1]) {
                        video.value.currentTime = props.subClip[0];
                    } else if (!props.subClip && video.value.currentTime >= video.value.duration) {
                        video.value.currentTime = 0;
                    }
                }
                currentTime.value = video.value.currentTime;
            }
        };

        const handleVideoEnded = () => {
            if (video.value && props.loopVideo) {
                if (props.subClip) {
                    video.value.currentTime = props.subClip[0];
                } else {
                    video.value.currentTime = 0;
                }
                video.value.play();
            }
        };

        onMounted(() => {
            if (video.value) {
                video.value.addEventListener("error", hideVideo);
                video.value.addEventListener("error", raiseError);
                video.value.addEventListener("loadedmetadata", showVideo);
                video.value.addEventListener("timeupdate", updateCurrentTime);
                video.value.addEventListener("ended", handleVideoEnded);
            }
        });

        onUnmounted(() => {
            if (video.value) {
                video.value.removeEventListener("error", hideVideo);
                video.value.removeEventListener("error", raiseError);
                video.value.removeEventListener("loadedmetadata", showVideo);
                video.value.removeEventListener("timeupdate", updateCurrentTime);
                video.value.removeEventListener("ended", handleVideoEnded);
            }
        });
        watchEffect(() => {
            updateVideoPlaybackRate();
            updateVideoLooping();
        });


        return {
            video,
            videoId,
            videoLoaded,
            duration,
            currentTime,
            updateVideoPlaybackRate,
            updateVideoLooping,
            sizeCalculated,
        };
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

.no-syllable {
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
