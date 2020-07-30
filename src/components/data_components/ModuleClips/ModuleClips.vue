<template>
    <div class="container">
        <div v-show="video_loaded">
            <b-pagination
                v-if="num_examples > 0"
                v-model="example_num"
                :total-rows="num_examples"
                :per-page="1"
                :limit="num_examples"
                :aria-controls="$id('video')"
                align="fill"
                :hide-goto-end-buttons="true"
                size="sm"></b-pagination>
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
            <video ref="video" :id="$id('video')"
                crossOrigin='anonymous'
                :src="movie_path"
                type="video/mp4"
                controls="true"
                autoplay="true"
                muted="true" />
        </div>
        <div v-show="!video_loaded" class="no-syllable">
            <b-card bg-variant="primary" text-variant="white" class="text-center">
                <b-card-text>
                    Sorry, there are no clips available for Syllable {{selected_syllable}} ({{count_method}}) 
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

RegisterDataComponent({
    friendly_name: 'Module Clips',
    component_type: 'ModuleClips',
    init_width: 330,
    init_height: 360,
    settings_type: 'ModuleClipsOptions',
    default_settings: {
        stream: 'rgb',
        loop: true,
        playback_rate: 1.0,
        only_subclip: true,
    },
});

export default mixins(WindowMixin).extend({
    data() {
        return {
            video_loaded: true,
            size_detected: false,
            current_time: 0,
            duration: 0,
            example_num: 1,
            ex_selection_height: 31,
        };
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
    computed: {
        selected_syllable(): number {
            return this.dataview.selectedSyllable;
        },
        count_method(): CountMethod {
            return this.dataview.countMethod;
        },
        items(): any[] {
            const ids = this.$store.getters[`${this.datasource}/selectedSyllableMap`];
            if (this.$store.state.datasets.manifest.hasOwnProperty('syllable_clips')) {
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
        subclip(): [number, number] {
            const item = this.current_item;
            const cStart = this.timeToSeconds(item.start_time);
            const cStop = this.timeToSeconds(item.end_time);
            const sStart = this.timeToSeconds(item.onset_time);
            const sStop = this.timeToSeconds(item.offset_time);
            return [sStart - cStart, sStop - cStart];
        },
        movie_path(): string {
            const item = this.current_item;
            if (item) {
                const base = item.base_name.replace('\\', '/');
                return `http://${GetAddress()}/${base}.${this.settings.stream}.mp4`;
            }
            return '';
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
    },
    methods: {
        show_video(ev: Event) {
            const video = this.$refs.video as HTMLVideoElement;
            this.video_loaded = true;
            this.duration = video.duration;
            if (this.settings.only_subclip) {
                video.currentTime = this.subclip[0];
            }
            this.updateVideoPlaybackRate();
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
            const windowRatio = (this.layout.height - this.ex_selection_height - 32) / this.layout.width;

            if (Number.isNaN(videoRatio)) {
                video.width = this.layout.width;
                return;
            }
            this.size_detected = true;

            if (windowRatio < videoRatio) {
                if (this.layout.height > 50) { /* smallest video height */
                    video.height = this.layout.height - 32 - this.ex_selection_height;
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
        updateCurrentTime() {
            const video = (this.$refs.video as HTMLVideoElement);
            if (this.settings.loop) {
                if (this.settings.only_subclip) {
                    if (video.currentTime > this.subclip[1]) {
                        video.currentTime = this.subclip[0];
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
            if (this.settings.loop) {
                if (this.settings.only_subclip) {
                    if (video.currentTime > this.subclip[1]) {
                        video.currentTime = this.subclip[0];
                    }
                } else {
                    if (video.currentTime >= video.duration) {
                        video.currentTime = 0;
                    }
                }
                video.play();
            }
        },
        onExampleClick(event) {
            this.example_num = event;
        },
        onPrevExampleClick() {
            if (this.example_num === 0) {
                this.example_num = this.num_examples - 1;
                return;
            }
            this.example_num--;
        },
        onNextExampleClick() {
            if (this.example_num === this.num_examples - 1) {
                this.example_num = 0;
                return;
            }
            this.example_num++;
        },
        timeToSeconds(time: string) {
            return time.split(':').reduce((acc,t) => (60 * acc) + Number.parseFloat(t), 0);
        },
    },
});
</script>

<style scoped>
.container {
    padding: 0;
    background-color: #000000;
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
.example {
    width: 20px;
    height: 20px;
    display: inline-block;
}
.b-pagination {
    margin-bottom:0;
}
</style>
