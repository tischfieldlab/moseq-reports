<template>
    <div id="testsyllable-container">
        <b-card class="test-header" title="Current Syllable">
          <b-form-group style="text-align: left;">
            <b-card-text>
                <h5>{{ this.syllable }}</h5>
                <br>
                <p>Don't worry this is just a test to show it works!</p>
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
import BaseDataComponent from '@/components/data_components/BaseDataComponent';

store.commit('registerComponent', <ComponentRegistration>{
    friendly_name: 'Test Syllable',
    component_type: 'test-syllable',
    settings_type: null,
});

export default Vue.component('test-syllable', {
    extends: BaseDataComponent,
    data() {
        return {
            syllable: DataModel.getSelectedSyllable(),
        };
    },
    mounted() {
        DataModel.subscribe(EventType.SYLLABLE_CHANGE, this.onSyllableChange);
    },
    methods: {
        onSyllableChange(syllable: any) {
            this.syllable = DataModel.getSelectedSyllable();
        },
    },
});
</script>

<style lang="scss" scoped>

</style>
