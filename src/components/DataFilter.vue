<template>
    <div>
        <b-card>
            <template v-slot:header>
                <b-button v-b-toggle.my-collapse variant="link" class="collapse-button text-decoration-none">
                    <span class="when-opened">&#x25B2;</span> <span class="when-closed">&#x25BC;</span>
                </b-button>
                <h6 class="mb-0" style="vertical-align: middle;display:inline-block;">Data Filters</h6>
            </template>
            <b-collapse visible id="my-collapse">
                <GroupBox />

                <b-input-group prepend="Count Method" class="filter-item">
                    <b-form-select v-model="selectedCountMethod" :options="countMethods" />
                </b-input-group>

                <b-input-group prepend="Selected Syllable" class="filter-item">
                    <b-form-select v-model="syllable" :options="syllableIdOptions">
                        <!--<template v-slot:first>
                            <option :value="-1" disabled>Select a Syllable</option>
                        </template>-->
                    </b-form-select>
                </b-input-group>
            </b-collapse>
        </b-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { CountMethod } from '@/store/dataview.store';
import { debounce } from 'ts-debounce';
import GroupBox from '@/components/GroupBox.vue';



export default Vue.extend({
    name: 'datafilter',
    components: {
        GroupBox,
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
                this.$store.dispatch('dataview/switchCountMethod', event);
            },
        },
    },
});
</script>

<style scoped lang="scss">
.collapse-button {
    float:right;
    padding:0;
}
.card-body{
    padding: 0 0.5em;
    min-height: 0;
}
.filter-item {
    margin:10px 0;
}
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
</style>