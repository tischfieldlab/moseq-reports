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
            size="sm"></b-pagination>
        <video-clips
            :countMethod="this.count_method"
            :videoPath="this.movie_path"
            :selectedSyllable="this.selected_syllable"
            :playbackRate="this.settings.playback_rate"
            :loopVideo="this.settings.loop"
            :onlySubClip="this.settings.only_subclip"
            :subClip="this.subclip"
            @aspectRatioCalculated="this.aspectRatioCalculated"
        />
    </div>
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
    friendly_name: 'Module Clips',
    component_type: 'ModuleClips',
    init_width: 360,
    init_height: 360,
    settings_type: 'ModuleClipsOptions',
    available_render_modes: [RenderMode.VIDEO],
    default_render_mode: RenderMode.VIDEO,
    default_settings: {
        stream: 'rgb',
        loop: true,
        playback_rate: 1.0,
        only_subclip: true,
    },
});

export default mixins(WindowMixin).extend({
    components: {
        VideoClips
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
    methods: {
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
        aspectRatioCalculated(payload: { aspectRatio: number }) {
            this.$store.commit(`${this.id}/updateAspectRatio`, { aspect_ratio: payload.aspectRatio });
        }
    },
});
</script>

<style scoped>
.video-container {
    height: calc(100% - 10px);
}
.b-pagination {
    margin-bottom:0;
}
</style>
