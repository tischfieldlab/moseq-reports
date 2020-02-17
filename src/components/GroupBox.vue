<template>
    <div id='groupbox-container' style=''>
        <b-card no-body class="primary_card">
            <b-card-header>Count Method</b-card-header>
            <b-card-body>
                <b-form-select v-model="selectedCountMethod" :options="countMethods" class="mb-3" />
            </b-card-body>
        </b-card>
        <b-card no-body class="primary_card" id="group_selection_container">
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
                <b-form-select v-model="syllable" :options="syllableIdOptions" class="mb-3">
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
import { CountMethod } from '@/store/dataview.store';
import { Chrome } from 'vue-color';
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
            colorChangeHandler: (option, event) => {/**/},
            countMethods: [
                { text: 'Usage', value: CountMethod.Usage },
                { text: 'Frames', value: CountMethod.Frames },
            ],
            watchers: Array<(() => void)>(),
        };
    },
    computed: {
        syllable: {
            get(): number {
                return this.$store.state.dataview.selectedSyllable;
            },
            set(event: number) {
                this.$store.commit('dataview/setSelectedSyllable', event);
            },
        },
        syllableIdOptions() {
            const max = this.$store.getters['dataview/maxSyllable'];
            const options: Array<{ value: number, text: string }> = [];
            for (let i = 0; i < max + 1; i++) {
                options.push({ value: i, text: i.toString() });
            }
            return options;
        },
        selectedCountMethod: {
            get(): CountMethod {
                return this.$store.state.dataview.countMethod;
            },
            set(event: CountMethod) {
                this.$store.commit('dataview/setCountMethod', event);
            },
        },
    },
    mounted() {
        this.colorChangeHandler = debounce((option, event) => {
            option.color = event.hex;
            this.updateColors();
        }, 250);

        this.watchers.push(this.$store.watch(
            (state, getters) => {
                return getters['dataview/availableGroups'];
            },
            (newValue: string[], oldValue: string[]) => {
                this.buildGroups();
            },
        ));
        this.buildGroups();
    },
    destroyed() {
        this.watchers.forEach((w) => w());
    },
    methods: {
        buildGroups() {
            this.groups = []; // Need to reset this so that we don't have duplicate options.
            const availableGroups = this.$store.getters['dataview/availableGroups'];
            const selectedGroups = this.$store.state.dataview.selectedGroups;
            const colorScale =  this.$store.state.dataview.groupColors;
            availableGroups.map((g, i) => {
                const sgi = new SelectableGroupItem(g, selectedGroups.includes(g));
                sgi.color = colorScale[i];
                this.groups.push(sgi);
            });
        },
        updateGroups() {
            const newGroups = this.groups.filter((g) => g.selected).map((g) => g.name);
            this.$store.commit('dataview/setSelectedGroups', newGroups);
            this.updateColors();
        },
        updateColors() {
            const colors = this.groups.filter((g) => g.selected).map((g) => g.color);
            this.$store.commit('dataview/setSelectedGroupColors', colors);
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