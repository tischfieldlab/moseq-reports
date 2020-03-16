<template>
    <div id="crowd-movies-container">
        <b-card class="test-header" title="CrowdMovies">
          <b-form-group style="text-align: left;">
            <b-card-text>
              <p> Syllable Number: {{this.word}} </p>
                <input v-model="message" placeholder="Enter path">
               
            <p>
                Current Filepath: {{ this.message }} <br/>
                Enter Filepath until syllable_
            </p>
            <div>
               <div v-if="crowd_movie_path">
                   Currently video having a Module not found error if given a path
                   {{crowd_movie_path}}
                    <video width="320" controls :src="crowd_movie_path" type="video/mp4" height="240" autoplay muted loop />
               </div>
               <div v-else>
                   No path/Wrong Path
               </div>
            </div>
            </b-card-text>
          </b-form-group> 
      </b-card>
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
});

export default Vue.component('crowd-movies', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {};
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

</style>
