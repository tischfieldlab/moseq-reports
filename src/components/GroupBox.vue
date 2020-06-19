<template>
    <b-card no-body class="group_selection filter-item">
        <div class="input-group-text">Group Selection</div>
        <b-list-group flush>
            <draggable v-model="groups" @change="updateGroups()">
                <b-list-group-item v-for="option in groups" :key="option.name">
                    <div :class="{'group-wrap': true, [option.style]: true}">
                        <b-form-checkbox
                            switch
                            @input="updateGroups()"
                            v-model="option.selected"
                            :name="option.name">
                        </b-form-checkbox>
                        <div class="swatch" :id="$id(option.id)" :style="{'background-color': option.color}" title="Click to select color">
                            <span class="group-count" :style="{'color': getContrast(option.color)}">{{group_counts[option.name]}}</span>
                        </div>
                        <b-popover :target="$id(option.id)" triggers="click blur" placement="top">
                            <template v-slot:title>Group Color ({{ option.name }})</template>
                            <chrome-picker :value="option.color" @input="colorChangeHandler(option, $event)" disableAlpha="true" />
                        </b-popover>
                        <span class="group_name" :title="option.name">{{ option.name }}</span>
                    </div>
                </b-list-group-item>
            </draggable>
        </b-list-group>
    </b-card>
</template>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import { Chrome } from 'vue-color';
import { debounce } from '@/util/Events';
import { unnest } from '@/util/Vuex';
import deepEqual from 'deep-equal';
import { DataviewState } from '../store/dataview.types';
import LoadData from '@/components/Core/DataLoader/DataLoader';




class SelectableGroupItem {
    public name: string;
    public selected: boolean;
    public color: string;
    public count: number = 0;

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
    props: {
        datasource: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            groups: [] as SelectableGroupItem[],
            group_counts: {},
            colorChangeHandler: (option, event) => {/**/},
            watchers: Array<(() => void)>(),
        };
    },
    computed: {
        dataview(): DataviewState {
            return unnest(this.$store.state, this.datasource);
        },
    },
    mounted() {
        this.colorChangeHandler = debounce((option, event) => {
            option.color = event.hex;
            this.updateColors();
        }, 100);

        this.watchers.push(this.$store.watch(
            (state, getters) => {
                return getters[`${this.datasource}/availableGroups`];
            },
            () => {
                if (this.datasource !== undefined) {
                    this.updateGroupCounts();
                    this.buildGroups();
                }
            },
            { immediate: true },
        ));
        this.watchers.push(this.$store.watch(
            (state, getters) => {
                const dv = unnest(state, this.datasource);
                if (dv === undefined) {
                    return {};
                }
                return {
                    c: unnest(state, this.datasource).groupColors || [] as string[],
                    s: unnest(state, this.datasource).selectedGroups || [] as string[],
                };
            },
            (newValue) => {
                if (newValue.s && newValue.c) {
                    this.groups.forEach((g) => {
                        const isSelected = newValue.s.includes(g.name);
                        g.selected = isSelected;
                        if (isSelected) {
                            g.color = newValue.c[newValue.s.indexOf(g.name)];
                        }
                    });
                }
            },
            { deep: true },
        ));
    },
    destroyed() {
        this.watchers.forEach((w) => w());
    },
    methods: {
        async buildGroups() {
            const groups = [] as SelectableGroupItem[]; // Need to reset this so that we don't have duplicate options.
            const availableGroups = this.$store.getters[`${this.datasource}/availableGroups`] || [];
            const selectedGroups = this.dataview !== undefined ? this.dataview.selectedGroups : [];
            const colorScale = this.dataview !== undefined ? this.dataview.groupColors : [];
            availableGroups.map((g, i) => {
                const sgi = new SelectableGroupItem(g, selectedGroups.includes(g));
                sgi.color = colorScale[i];
                groups.push(sgi);
            });
            this.groups = groups;
        },
        updateGroups() {
            const groups = this.groups.filter((g) => g.selected).map((g) => g.name);
            const colors = this.groups.filter((g) => g.selected).map((g) => g.color);
            if (!deepEqual(groups, this.dataview.selectedGroups)) {
                this.$store.dispatch(`${this.datasource}/updateSelectedGroups`, {
                    groups,
                    colors,
                });
            }
        },
        updateColors() {
            const colors = this.groups.filter((g) => g.selected).map((g) => g.color);
            if (!deepEqual(colors, this.dataview.groupColors)) {
                this.$store.dispatch(`${this.datasource}/updateSelectedGroups`, {colors});
            }
        },
        async updateGroupCounts() {
            try {
                this.group_counts = await LoadData(this.$store.getters[`datasets/resolve`]('samples'), [{type: 'map'}])
                    .then((data: any[]) => {
                        return data.reduce((acc, curr) => {
                            if (acc[curr.default_group] === undefined) {
                                acc[curr.default_group] = 1;
                            } else {
                                acc[curr.default_group] += 1;
                            }
                            return acc;
                        }, {});
                    });
            } catch {
                return;
            }
        },
        getContrast(hexcolor: string): string {
            try {
                // If a leading # is provided, remove it
                if (hexcolor.slice(0, 1) === '#') {
                    hexcolor = hexcolor.slice(1);
                }
                // If a three-character hexcode, make six-character
                if (hexcolor.length === 3) {
                    hexcolor = hexcolor.split('').map((hex) => hex + hex).join('');
                }
                // Convert to RGB value
                const r = parseInt(hexcolor.substr(0,2),16);
                const g = parseInt(hexcolor.substr(2,2),16);
                const b = parseInt(hexcolor.substr(4,2),16);
                // Get YIQ ratio
                const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                // Check contrast
                return (yiq >= 128) ? 'black' : 'white';
            } catch {
                return 'black';
            }
        }
    },
});
</script>

<style scoped>
.list-group {
    margin: -1px;
}
.list-group-item {
    padding: 0.5em 0.25em;
}
.group-wrap {
    height:24px;
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
.group_selection .input-group-text {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    margin: -1px;
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
    border-radius: 24px;
    cursor: pointer;
    text-align: center;
    font-size: 10px;
    line-height: 21px;
    font-weight: bold;
}
.group_name {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 175px;
    font-size: 13px;
    padding:2.5px 0px;
}
</style>