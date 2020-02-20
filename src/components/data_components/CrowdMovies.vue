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
               <div v-if='pathchecker()'>
                   Currently video having a Module not found error if given a path
                <!-- <video width="320" controls :src="require(this.message + this.word + '.mp4')" type="video/mp4" height="240"  autoplay muted loop/> -->
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

import DataModel, { EventType } from '@/models/DataModel';
import store from '@/store/root.store';

import {ComponentRegistration} from '@/store/root.types';

store.commit('registerComponent', {
    friendly_name: 'CrowdMovies',
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
        return {
            message: '',
            syllable: DataModel.getSelectedSyllable(),
            word: DataModel.getSelectedSyllable().toString(),
        };
    },
        mounted() {
            DataModel.subscribe(EventType.SYLLABLE_CHANGE, this.onSyllableChange);
            this.$nextTick(() => {
                this.word = this.word = DataModel.getSelectedSyllable().toString();
                    });
    },
         destroyed() {
        DataModel.unsubscribe(EventType.SYLLABLE_CHANGE, this.onSyllableChange);
    },
    methods: {
        pathchecker() {
            if (this.message.includes('syllable_')) {
            this.word = DataModel.getSelectedSyllable().toString();
            return true;
            }
            return false;
        },
        onSyllableChange(syllable: any) {
            this.syllable = DataModel.getSelectedSyllable();
            this.word = DataModel.getSelectedSyllable().toString();
        },
    },
});

</script>

<style lang="scss" scoped>

</style>
