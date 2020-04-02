<template>
    <div>
        <b-card>
            <template v-slot:header>
                <b-button v-b-toggle="$id('filter-collapse')" variant="link" class="collapse-button text-decoration-none">
                    <span class="when-opened">&#x25BC;</span> <span class="when-closed">&#x25B6;</span>
                </b-button>
                <h7>{{ dataview }}</h7>
            </template>
            <b-collapse visible :id="$id('filter-collapse')">
                <b-overlay :show="is_loading" no-fade>
                    <div class="container">
                        <GroupBox :datasource="dataview" />

                        <b-input-group prepend="Count Method" class="filter-item">
                            <b-form-select v-model="selectedCountMethod" :options="countMethods" />
                        </b-input-group>

                        <b-input-group prepend="Selected Syllable" class="filter-item">
                            <b-form-select debounce="1000" v-model="syllable" :options="syllableIdOptions" />
                        </b-input-group>

                        <SyllableIdFilter :datasource="dataview" />
                    </div>
                </b-overlay>
            </b-collapse>
        </b-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { CountMethod, DataviewState } from '@/store/dataview.types';
import { debounce } from 'ts-debounce';
import GroupBox from '@/components/GroupBox.vue';
import SyllableIdFilter from '@/components/SyllableIdFilter.vue';
import { unnest } from '@/util/Vuex';



export default Vue.component('datafilter', {
    components: {
        GroupBox,
        SyllableIdFilter,
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
        dataview(): DataviewState {
            return unnest(this.$store.state, this.datasource);
        },
        is_loading(): boolean {
            return this.dataview && this.dataview.loading;
        },
        syllable: {
            get(): number {
                return this.dataview.selectedSyllable;
            },
            set(event: number) {
                this.$store.commit(`${this.datasource}/setSelectedSyllable`, event);
            },
        },
        syllableIdOptions(): Array<{ value: number, text: string }> {
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
        selectedCountMethod: {
            get(): CountMethod {
                return this.dataview.countMethod;
            },
            set(event: CountMethod) {
                this.$store.dispatch(`${this.datasource}/switchCountMethod`, event);
            },
        },
    },
});
</script>

<style scoped lang="scss">
.collapse-button {
    padding:0;
    margin-left:-10px;
    margin-right: 10px;
}
.card-body{
    padding: 0;
    min-height: 0;
}
.filter-item {
    margin:10px 0;
}
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
.container {
    padding: 0.5em;
}
</style>