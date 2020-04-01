<template class>
<div v-if="crowd_movie_path">
<p class="par">Crowd Movie for Syllable {{syllable_ID}} </p>
<div>
    <video class = "vido" controls :src="crowd_movie_path" type="video/mp4" autoplay muted loop />
</div>
</div>
<div v-else>
    No path/Wrong Path
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/data_components/Core';
import path from 'path';
import url from 'url';
import { CountMethod } from '../../store/dataview.store';

RegisterDataComponent({
    friendly_name: 'Crowd Movies',
    component_type: 'crowd-movies',
    init_width:580,
    init_height:500,
});

export default Vue.component('crowd-movies', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            syllable_ID: this.$store.getters['dataview/selectedSyllableAs'](CountMethod.Usage),
        };
    },
    computed: {
        crowd_movie_path(): string {
            const uID = this.$store.getters['dataview/selectedSyllableAs'](CountMethod.Usage);
            const rID = this.$store.getters['dataview/selectedSyllableAs'](CountMethod.Raw);
            const fname = `syllable_sorted-id-${uID} (usage)_original-id-${rID}.mp4`;
            return `http://localhost:8989/crowd_movies/${fname}`;
        }, 
    },
});
</script>

<style lang="scss" scoped>
.vido{
    width: 100%;
    height: auto;
    margin:0;
    padding:0;
}
.par{
    text-align:center;
}
</style>
