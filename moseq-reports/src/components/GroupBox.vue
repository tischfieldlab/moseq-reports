<template>
    <div id='groupbox-container' style='padding-top: 15px; float: left;'>
      <b-card class="groups-header">
          <b-form-group style="text-align: left;">
            <h4>Group Selection</h4>
            <b-card-text>
              <b-form-checkbox-group v-model="selectedGroups" stacked @change="onGroupSelectionChange($event)">
                <draggable :list="availableGroups" @change="onGroupOrderChange($event)">
                  <b-card v-for="option in availableGroups" :key="option" class="chk-card">
                    <b-form-checkbox
                      :value="option"
                      :name="option">
                      {{ option }}
                    </b-form-checkbox>
                  </b-card>
                </draggable>
              </b-form-checkbox-group>
            </b-card-text>
          </b-form-group>
          <br>
          <b-form-group style="text-align: left; margin-bottom: -15px;">
            <h4>Syllable Selection</h4>
            <b-card-text>
               <b-form-select v-model="syllable" :options="syllableIdOptions" @change="onSyllableChange($event)" class="mb-3">
                        <template v-slot:first>
                            <option :value="-1" disabled>Select a Syllable</option>
                        </template>
                </b-form-select>
            </b-card-text>
          </b-form-group>
      </b-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import DataModel, { EventType } from '../DataModel';

export default Vue.extend({
    name: 'groupbox',
    components: {
      draggable
    },
    data() {
        return {
            selectedGroups: DataModel.getSelectedGroups(),
            availableGroups: DataModel.getAvailableGroups(),
            syllable: DataModel.getSelectedSyllable(),
            syllableIdOptions: [] as any,
        };
    },
    mounted() {
      DataModel.subscribe(EventType.SYLLABLE_CHANGE, this.updateSyllable);
      this.getsyllableIdOptions();
    },
    methods: {
      onGroupSelectionChange(event: any) {
        DataModel.updateSelectedGroups(event);
      },
      onGroupOrderChange(event: any){
        DataModel.updateSelectedGroups(this.selectedGroups);
        console.log("in onGroupOrderChange", this.selectedGroups);
      },
      updateSyllable(event: any) {
        this.syllable = DataModel.getSelectedSyllable();
      },
      onSyllableChange(event: any) {
        DataModel.updateSelectedSyllable(event);
      },
      getsyllableIdOptions() {
        const max = DataModel.getMaxSyllable();

        for (let i = 0; i < max + 1; i++) {
          const val = '' + i;
          const temp = { value: val, text: val };
          this.syllableIdOptions.push(temp);
        }
      },
    },
});
</script>

<style scoped lang="scss">
.chk-card .card-body{
  padding:0.25rem;
}
.custom-checkbox::after{
  content:"\22EE";
  float:right;
  margin-right: 5px;
  cursor:grab;
}
</style>