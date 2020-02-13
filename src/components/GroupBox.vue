<template>
    <div id='groupbox-container' style=''>
        <b-card no-body class="primary_card">
            <b-card-header>Count Method</b-card-header>
            <b-card-body>
                <b-form-select v-model="selectedCountMethod" :options="countMethods" @change="onCountMethodChange($event)" class="mb-3">
                </b-form-select>
            </b-card-body>
        </b-card>
        <b-card no-body class="primary_card" id="group_selection_container">
            <!--<b-form-group style="text-align: left;">-->
            <b-card-header>Group Selection</b-card-header>
            <b-card-body>
              <draggable v-model="groups" @change="updateGroups()">
                    <b-card v-for="option in groups" :key="option.name" class="chk-card">
                        <div :class="{'group-wrap': true, [option.style]: true}">
                            <b-form-checkbox
                                switch
                                @input="updateGroups()"
                                v-model="option.selected"
                                :name="option.name">
                            </b-form-checkbox>
                            <div class="swatch" :id="option.id" :style="{'background-color': option.color}" />
                            <b-popover :target="option.id" triggers="click blur" placement="top">
                                <template v-slot:title>{{ option.name }} Group Color</template>
                                <chrome-picker :value="option.color" @input="colorChangeHandler(option, $event)" disableAlpha="true" />
                            </b-popover>
                            <span>{{ option.name }}</span>
                        </div>
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
import { Chrome } from 'vue-color';
import { schemeDark2 } from 'd3-scale-chromatic';
import {scaleOrdinal} from 'd3-scale';
import { debounce } from 'ts-debounce';



class SelectableGroupItem {
    public name: string;
    public selected: boolean;
    public color: string;

    get style(): string {
        return this.selected ? 'selected' : 'non-selected';
    }
    get id(): string {
        return 'group_' + this.name.replace(/\W/g, '_');
    }

    constructor(name: string, selected: boolean = true) {
        this.name = name;
        this.selected = selected;
        this.color = '#000000';
    }
}

export default Vue.extend({
    name: 'groupbox',
    components: {
        draggable,
        'chrome-picker': Chrome,
    },
    data() {
        return {
            groups: [] as SelectableGroupItem[],
            syllable: DataModel.getSelectedSyllable(),
            syllableIdOptions: [] as any,
            colorChangeHandler: (option, event) => {/**/},
            countMethods: ['Usage', 'Frames'],
            selectedCountMethod: 'Usage',
        };
    },
    mounted() {
        this.colorChangeHandler = debounce((option, event) => {
            option.color = event.hex;
            this.updateColors();
        }, 250);

        DataModel.subscribe(EventType.SYLLABLE_CHANGE, this.updateSyllable);
        DataModel.subscribe(EventType.METADATA_LOADED, this.buildGroups);
        this.buildGroups();
        this.getsyllableIdOptions();
    },
    methods: {
        buildGroups() {
            const colorScale = scaleOrdinal(schemeDark2);
            this.groups = []; // Need to reset this so that we don't have duplicate options.
            const selectedGroups = DataModel.getSelectedGroups();
            DataModel.getAvailableGroups()
                     .map((g) => {
                         const sgi = new SelectableGroupItem(g, selectedGroups.includes(g));
                         sgi.color = colorScale(g);
                         this.groups.push(sgi);
                     });
            this.updateColors();
        },
        updateGroups() {
            const newGroups = this.groups.filter((g) => g.selected).map((g) => g.name);
            DataModel.updateSelectedGroups(newGroups);
            this.updateColors();
        },
        updateColors() {
            const colors = this.groups.filter((g) => g.selected).map((g) => g.color);
            DataModel.updateSelectedGroupColors(colors);
        },
        updateSyllable(event: any) {
            this.syllable = DataModel.getSelectedSyllable();
        },
        onSyllableChange(event: any) {
            DataModel.updateSelectedSyllable(event);
        },
        onCountMethodChange(event: any) {
            // DataModel.updateSelectedSyllable(event);
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
.group-wrap::after{
  content:"\22EE";
  float:right;
  margin-right: 5px;
  cursor:grab;
}
.group-wrap.non-selected{
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
.custom-switch {
    float:left;
}
.swatch {
    width:24px;
    height:24px;
    float:left;
    border:1px solid #efefef;
    margin: 0 10px 0 5px;
}
</style>