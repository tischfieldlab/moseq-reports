<template>
    <div>
        <b-card>
            <template v-slot:header>
                <b-button v-b-toggle="$id('filter-collapse')" variant="link" class="text-dark collapse-button text-decoration-none">
                    <span class="when-opened">&#x25BC;</span><span class="when-closed">&#x25B6;</span>
                </b-button>
                <b-button variant="link" @click="removeThis" class="text-dark remove-button text-decoration-none">
                    &#x1F5D9;
                </b-button>
                <EditableText class="editable-text" v-model="filter_name" />
            </template>
            <b-collapse visible :id="$id('filter-collapse')">
                <b-overlay :show="is_loading" no-fade>
                    <div class="container">
                        <GroupBox :datasource="datasource" />

                        <b-input-group prepend="Count Method" class="filter-item">
                            <b-form-select v-model="selectedCountMethod" :options="countMethods" />
                        </b-input-group>

                        <b-input-group prepend="Selected Syllable" class="filter-item">
                            <b-form-select debounce="1000" v-model="syllable" :options="syllableIdOptions" />
                        </b-input-group>

                        <SyllableIdFilter :datasource="datasource" />
                    </div>
                </b-overlay>
            </b-collapse>
        </b-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { CountMethod, DataviewState } from '@/store/dataview.types';
import GroupBox from '@/components/GroupBox.vue';
import SyllableIdFilter from '@/components/SyllableIdFilter.vue';
import { unnest } from '@/util/Vuex';
import EditableText from './EditableText.vue';


export default Vue.component('datafilter', {
    components: {
        GroupBox,
        SyllableIdFilter,
        EditableText,
    },
    props: {
        datasource: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            countMethods: [
                { text: 'Usage', value: CountMethod.Usage },
                { text: 'Frames', value: CountMethod.Frames },
            ],
        };
    },
    computed: {
        filter_name: {
            get(): string {
                if (this.dataview === undefined) {
                    return '';
                }
                return this.dataview.name;
            },
            set(value: string) {
                this.$store.commit(`${this.datasource}/setName`, value);
            },
        },
        dataview(): DataviewState {
            return unnest(this.$store.state, this.datasource);
        },
        is_loading(): boolean {
            return this.dataview && this.dataview.loading;
        },
        selectedCountMethod: {
            get(): CountMethod {
                if (this.dataview === undefined) {
                    return CountMethod.Usage;
                }
                return this.dataview.countMethod;
            },
            set(value: CountMethod) {
                if (value !== this.selectedCountMethod) {
                    this.$store.dispatch(`${this.datasource}/switchCountMethod`, value);
                }
            },
        },
        syllable: {
            get(): number {
                if (this.dataview === undefined) {
                    return 0;
                }
                return this.dataview.selectedSyllable;
            },
            set(value: number) {
                if (value !== this.syllable) {
                    this.$store.commit(`${this.datasource}/setSelectedSyllable`, value);
                }
            },
        },
        syllableIdOptions(): { value: number, text: string }[] {
            if (this.dataview === undefined) {
                return [];
            }
            const filtered = this.dataview.moduleIdFilter;
            if (filtered.length === 0) {
                const avail = this.$store.getters[`${this.datasource}/availableModuleIds`];
                return avail.map((i) => {
                    return { value: i, text: i.toString() };
                });
            } else {
                return this.dataview.moduleIdFilter.map((i) => {
                    return { value: i, text: i.toString() };
                });
            }
            return [];
        },
    },
    methods: {
        removeThis() {
            if (this.$store.getters['filters/default'] === this.datasource) {
                this.$bvModal.msgBoxOk('You cannot remove the default filter.');
            } else {
                this.$bvModal.msgBoxConfirm('Are you sure you want to remove this data filter?', {

                }).then((value) => {
                    if (value) {
                        this.$store.dispatch('filters/removeFilter', this.datasource);
                    }
                });
            }
        },
    },
});
</script>

<style scoped>
.collapse-button {
    padding: 0;
    margin-left: -10px;
    margin-right: 10px;
}
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
    display: none;
}
.remove-button {
    float: right;
    padding: 0;
    margin-right: -10px;
}
.card-body{
    padding: 0;
    min-height: 0;
}
.filter-item {
    margin:10px 0;
}

.container {
    padding: 0.5em;
}
div.editable-text {
    display: inline;
}
div.editable-text >>> input {
    width: calc(100% - 60px);
    display: inline-block;
}
.card-header {
    padding-top: 0.25em;
    padding-bottom: 0.25em;
}
</style>