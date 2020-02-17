<template>
    <div id="testsyllable-container">
        <b-card class="test-header" title="Current Syllable">
          <b-form-group style="text-align: left;">
            <b-card-text>
                <h5>{{ this.syllable }}</h5>
            </b-card-text>
          </b-form-group>
      </b-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import store from '@/store/root.store';
import {ComponentRegistration} from '@/store/root.types';

store.commit('registerComponent', {
    friendly_name: 'Test Syllable',
    component_type: 'test-syllable',
    init_width: 250,
    init_height: 175,
});

export default Vue.component('test-syllable', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    computed: {
        syllable(): number {
            return this.$store.state.dataview.selectedSyllable;
        },
    },
});
</script>

<style lang="scss" scoped>

</style>
