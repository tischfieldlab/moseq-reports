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
                        <GroupBox :dataview="dataview" />

                        <b-input-group prepend="Count Method" class="filter-item">
                            <b-form-select v-model="selectedCountMethod" :options="countMethods" />
                        </b-input-group>

                        <b-input-group prepend="Selected Syllable" class="filter-item">
                            <b-form-select debounce="1000" v-model="syllable" :options="syllableIdOptions" />
                        </b-input-group>
                    </div>
                </b-overlay>
            </b-collapse>
        </b-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { CountMethod } from '@/store/dataview.store';
import { debounce } from 'ts-debounce';
import GroupBox from '@/components/GroupBox.vue';
import { unnest } from '@/util/Vuex';



export default Vue.component('datafilter', {
    components: {
        GroupBox,
    },
    props: {
        dataview: {
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
        is_loading(): boolean {
            return unnest(this.$store.state, this.dataview).loading;
        },
        syllable: {
            get(): number {
                return unnest(this.$store.state, this.dataview).selectedSyllable;
            },
            set(event: number) {
                this.$store.commit(`${this.dataview}/setSelectedSyllable`, event);
            },
        },
        syllableIdOptions() {
            const max = this.$store.getters[`${this.dataview}/maxSyllable`];
            const options: Array<{ value: number, text: string }> = [];
            for (let i = 0; i < max + 1; i++) {
                options.push({ value: i, text: i.toString() });
            }
            return options;
        },
        selectedCountMethod: {
            get(): CountMethod {
                return unnest(this.$store.state, this.dataview).countMethod;
            },
            set(event: CountMethod) {
                this.$store.dispatch(`${this.dataview}/switchCountMethod`, event);
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