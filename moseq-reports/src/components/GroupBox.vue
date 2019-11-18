<template>
    <div id='groupbox-container' style=''>
        <b-card no-body class="primary_card" id="group_selection_container">
            <!--<b-form-group style="text-align: left;">-->
            <b-card-header>Group Selection</b-card-header>
            <b-card-body>
              <draggable v-model="groups" @change="updateGroups()">
                  <b-card v-for="option in groups" :key="option.name" class="chk-card">
                    <b-form-checkbox
                      switch
                      @input="updateGroups()"
                      v-model="option.selected"
                      :name="option.name"
                      :class="option.style">
                      {{ option.name }}
                    </b-form-checkbox>
                  </b-card>
                </draggable>
            </b-card-body>
        </b-card>
        <b-card no-body class="primary_card">
            <b-card-header>Syllable Selection</b-card-header>
            <b-card-body>
                <b-form-select v-model="syllable" :options="syllableIdOptions" @change="onSyllableChange($event)" class="mb-3">
                    <template v-slot:first>
                        <option :value="-1" disabled>Select a Syllable</option>
                    </template>
                </b-form-select>
            </b-card-body>
        </b-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import DataModel, { EventType } from '@/models/DataModel';


class SelectableGroupItem {
  public name: string;
  public selected: boolean;
  get style() {
      return this.selected ? '' : 'non-selected';
  }
  constructor(name: string, selected: boolean = true) {
    this.name = name;
    this.selected = selected;
  }
}

export default Vue.extend({
    name: 'groupbox',
    components: {
        draggable,
    },
    data() {
        return {
            groups: [] as SelectableGroupItem[],
            syllable: DataModel.getSelectedSyllable(),
            syllableIdOptions: [] as any,
        };
    },
    mounted() {
        DataModel.subscribe(EventType.SYLLABLE_CHANGE, this.updateSyllable);
        this.buildGroups();
        this.getsyllableIdOptions();
    },
    methods: {
        buildGroups() {
            const selectedGroups = DataModel.getSelectedGroups();
            DataModel.getAvailableGroups()
                     .map((g) => {
                         const sgi = new SelectableGroupItem(g, selectedGroups.includes(g));
                         this.groups.push(sgi);
                     });
        },
        updateGroups() {
            const newGroups = this.groups.filter((g) => g.selected).map((g) => g.name);
            //console.log("in updateGroups", newGroups);
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
.primary_card{
    margin:10px;
}
.primary_card .card-body{
    padding: 0;
}
.chk-card .card-body{
  padding:0.25rem;
}
.custom-switch::after{
  content:"\22EE";
  float:right;
  margin-right: 5px;
  cursor:grab;
}
.custom-switch.non-selected{
    color:#AAAAAA;
}
.card-header{
    font-weight: bold;
}
.card-body{
    text-align: left;
}
.primary_card select{
    margin:0 !important;
}
</style>