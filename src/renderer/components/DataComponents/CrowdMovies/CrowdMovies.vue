<template>
    <video-clips
        :videoPath="crowdMoviePath"
        :playbackRate="settings.playback_rate"
        :loopVideo="settings.loop"
        @sizeCalculated="sizeCalculated"
        @error="onVideoError"
    >
        <template #prepend>
            <span> Syllable {{ selected_syllable }} ({{ count_method }}) </span>
        </template>
        <template #no-video>
            <BCard bg-variant="primary" text-variant="white" class="text-center">
                <BCardText>
                    Sorry, there is no crowd movie available for Syllable {{ selected_syllable }} ({{ count_method }}).
                </BCardText>
            </BCard>
        </template>
    </video-clips>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import RegisterDataComponent from "@render/components/Core";
import { CountMethod } from "@store/dataview.types";
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";
import VideoClips from "@render/components/Charts/VideoPlayer/VideoPlayer.vue";
import { RenderMode } from "@store/datawindow.types";
import DataService from "@api";


export default defineComponent({
    name: "CrowdMovies",
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
        const { dataview, $wstate, settings} = useWindowMixin<CrowdMoviesOptions>(props.id);

        const crowdMoviePathsToTry = computed(() => {
            const uID = dataview.value.selectedSyllableAs(CountMethod.Usage);
            const rID = dataview.value.selectedSyllableAs(CountMethod.Raw);

            // new format with zero-padded IDs and no spaces
            const formatted_uid = String(uID).padStart(2, "0");
            const formatted_rid = String(rID).padStart(2, "0");
            const fname1 = `syllable_sorted-id-${formatted_uid}_(usage)_original-id-${formatted_rid}.mp4`;

            // older format for backward compatibility
            const fname2 = `syllable_sorted-id-${uID} (usage)_original-id-${rID}.mp4`;

            return [
                DataService.resolveWithToken(`/crowd_movies/${encodeURIComponent(fname1)}`),
                DataService.resolveWithToken(`/crowd_movies/${encodeURIComponent(fname2)}`),
            ];
        });

        const currentPath = ref(0);
        const crowdMoviePath = computed(() => {
            return crowdMoviePathsToTry.value[currentPath.value];
        });

        const selected_syllable = computed(() => dataview.value.selectedSyllable);
        const count_method = computed(() => dataview.value.countMethod);


        const sizeCalculated = (payload: { width: number; height: number }) => {
            const { width, height } = payload;

            $wstate.updateAspectRatio({
                aspect_ratio: width / height,
            });
        };

        const onVideoError = (event: string, args: any) => {
            if (currentPath.value < crowdMoviePathsToTry.value.length - 1) {
                currentPath.value += 1;
                return;
            }
        };

        watch(() => dataview.value.selectedSyllable,
            () => {
                currentPath.value = 0; // Reset to the first path when syllable changes
            },
            {flush: 'sync'}
        );


        return {
            crowdMoviePath,
            settings,
            selected_syllable,
            count_method,
            sizeCalculated,
            onVideoError,
        };
    },
});


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
</script>

