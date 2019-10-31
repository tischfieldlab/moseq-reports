<template>
    <div id='groupbox-container' style='padding-top: 15px; float: left;'>
      <b-card class="groups-header">
          <b-form-group style="text-align: left;">
            <h4>Group Selection</h4>
            <b-card-text>
              <draggable v-model="groups" @change="updateGroups()">
                  <b-card v-for="option in groups" :key="option.name" class="chk-card">
                    <b-form-checkbox
                      switch
                      @input="updateGroups()"
                      v-model="option.selected"
                      :name="option.name">
                      {{ option.name }}
                    </b-form-checkbox>
                  </b-card>
                </draggable>
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


class SelectableGroupItem{
  name: string;
  selected: boolean;
  constructor(name:string, selected:boolean = true){
    this.name = name;
    this.selected = selected;
  }
}

export default Vue.extend({
    name: 'groupbox',
    components: {
      draggable
    },
    data() {
        return {
            groups: [] as Array<SelectableGroupItem>,
            syllable: DataModel.getSelectedSyllable(),
            syllableIdOptions: [] as any,
        };
    },
    mounted() {
      DataModel.subscribe(EventType.SYLLABLE_CHANGE, this.updateSyllable);
      this.buildGroups()
      this.getsyllableIdOptions();
    },
    methods: {
      buildGroups(){
        const selectedGroups = DataModel.getSelectedGroups();
        DataModel.getAvailableGroups().map(g => this.groups.push(new SelectableGroupItem(g, selectedGroups.includes(g))));
      },
      updateGroups(){
        const newGroups = this.groups.filter(g => g.selected).map(g => g.name);
        console.log("in updateGroups", newGroups);
        DataModel.updateSelectedGroups(newGroups);
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
.custom-switch::after{
  content:"\22EE";
  float:right;
  margin-right: 5px;
  cursor:grab;
}
</style>