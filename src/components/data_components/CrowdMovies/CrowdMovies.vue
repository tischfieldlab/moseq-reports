<template>
    <div v-if="crowd_movie_path">
        <p class="par">Crowd Movie for Syllable {{selected_syllable}} ({{count_method}}) </p>
        <div>
            <video class="vido" controls :src="crowd_movie_path" type="video/mp4" autoplay muted loop />
        </div>
    </div>
    <div v-else>
        No path/Wrong Path
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/Core';
import path from 'path';
import url from 'url';
import { CountMethod } from '@/store/dataview.types';
import mixins from 'vue-typed-mixins';
import LoadingMixin from '@/components/Core/LoadingMixin';
import WindowMixin from '@/components/Core/WindowMixin';
import {CreateCrowdMovieServer} from './CrowdMoviesServer';

RegisterDataComponent({
    friendly_name: 'Crowd Movies',
    component_type: 'CrowdMovies',
    init_width: 580,
    init_height: 500,
});
CreateCrowdMovieServer();

export default mixins(LoadingMixin, WindowMixin).extend({
    data() {
        return {};
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
            return `http://localhost:8989/crowd_movies/${fname}`;
        },
    },
});
</script>

<style scoped>
.vido {
    width: 100%;
    height: auto;
    margin:0;
    padding:0;
}
.par {
    text-align:center;
}
</style>
