<template>
    <div class="video-container">
        <BPagination
            v-if="numExamples > 0"
            v-model="exampleNum"
            :total-rows="numExamples"
            :per-page="1"
            :limit="numExamples+1"
            align="fill"
            :aria-controls="videoId"
            :no-goto-end-buttons="true"
            size="sm"
        />

        <video-clips
            :videoPath="moviePath"
            :playbackRate="settings.playback_rate"
            :loopVideo="settings.loop"
            :subClip="settings.only_subclip ? subclip : undefined"
            @sizeCalculated="sizeCalculated"
        >
            <template #prepend>
                <span> Syllable {{ selectedSyllable }} ({{ countMethod }}) </span>
            </template>

            <template #no-video>
                <BCard bg-variant="primary" text-variant="white" class="text-center">
                    <BCardText>
                        Sorry, there is no crowd movie available for Syllable {{ selectedSyllable }} ({{ countMethod }})
                    </BCardText>
                </BCard>
            </template>
        </video-clips>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";
import RegisterDataComponent from "@render/components/Core";
import VideoClips from "@render/components/Charts/VideoPlayer/VideoPlayer.vue";
import { RenderMode } from "@render/store/datawindow.types";
import {useDatasetsStore} from "@store/datasets.store";
import { ModuleClipsSettings } from "./ModuleClips.types";
import DataService from "@api";

RegisterDataComponent({
    friendly_name: "Syllable Clips",
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

export default defineComponent({
    name: "ModuleClips",
    components: {
        VideoClips,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        //const store = useStore();
        const datasetsStore = useDatasetsStore();
        const { $wstate, layout, dataview, settings } = useWindowMixin<ModuleClipsSettings>(props.id);
        const exampleNum = ref(1);
        const videoId = ref(`video-${Math.random().toString(36).substr(2, 9)}`);
        const selectedSyllable = computed(() => dataview.value.selectedSyllable);
        const countMethod = computed(() => dataview.value.countMethod);
        const items = computed(() => {
            const ids = dataview.value.selectedSyllableMap;
            const clips = (datasetsStore.manifest?.syllable_clips as any).manifest || [];
            return clips.filter((row: any) => row.sid_raw === ids.raw);
        });

        const numExamples = computed(() => items.value.length);
        const currentItem = computed(() => items.value[exampleNum.value - 1]);

        const timeToSeconds = (time: string): number => time.split(":").reduce((acc, t) => 60 * acc + parseFloat(t), 0);

        const subclip = computed((): [number, number] => {
            const item = currentItem.value;
            if (!item) return [0, 0];
            const cStart = timeToSeconds(item.start_time);
            const sStart = timeToSeconds(item.onset_time);
            const sStop = timeToSeconds(item.offset_time);
            return [sStart - cStart, sStop - cStart];
        });

        const moviePath = computed(() => {
            const item = currentItem.value;
            if (!item) return "";
            const base = item.base_name.replace("\\", "/");
            return DataService.resolveWithToken(`/${base}.${settings.value.stream}.mp4`)
        });

        const sizeCalculated = (payload: { width: number; height: number }) => {
            const aspectRatio = payload.width / (payload.height + 10 * (layout.value.width / layout.value.height));
            $wstate.updateAspectRatio({ aspect_ratio: aspectRatio });
        };

        return {
            exampleNum,
            numExamples,
            selectedSyllable,
            countMethod,
            items,
            currentItem,
            subclip,
            moviePath,
            settings,
            videoId,
            sizeCalculated,
        };
    },
});
</script>

<style scoped>
.video-container {
    height: calc(100% - 10px);
}
.pagination {
    margin-bottom: 0;
}
</style>
