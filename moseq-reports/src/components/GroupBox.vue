<template>
    <div id='groupbox-container' style='padding-top: 15px; float: left;'>
      <b-card class="groups-header" title="Group Selection">
          <b-form-group style="text-align: left;">
            <b-card-text>
              <b-form-checkbox-group v-model='selected' :options='availableGroups'
                @change='onChange($event)' stacked>
              </b-form-checkbox-group>
            </b-card-text>
          </b-form-group>
      </b-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import DataModel, { EventType } from '../DataModel';

export default Vue.extend({
    name: 'groupbox',
    data() {
        return {
            selected: DataModel.getSelectedGroups(),
            availableGroups: DataModel.getAvailableGroups(),
            syllable: DataModel.getSelectedSyllable(),
        };
    },
    methods: {
      onChange(event: any) {
        DataModel.updateSelectedGroups(event);
      },
    },
});
</script>

<style scoped lang="scss">

</style>