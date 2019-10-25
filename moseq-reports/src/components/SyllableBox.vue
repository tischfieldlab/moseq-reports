<template>
    <div id='syllablebox-container' style="padding-top: 15px; float: left;">
        <b-card class="syllables-header" title="Syllable Selection">
            <b-form-group style="text-aling: left;">
                <b-card-text>
                    <b-form-select v-model="selected" :options="options" @change="onSyllableChange($event)" class="mb-3">
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

import DataModel, { EventType } from '../DataModel';

export default Vue.extend({
    name: 'syllablebox',
    data() {
        return {
            selected: DataModel.getSelectedSyllable(),
            options: [] as any,
        };
    },
    mounted() {
        DataModel.subscribe(EventType.SYLLABLE_CHANGE, this.updateSyllable);
        this.getOptions();
    },
    methods: {
        updateSyllable(event: any) {
            this.selected = DataModel.getSelectedSyllable();
        },
        onSyllableChange(event: any) {
            DataModel.updateSelectedSyllable(event);
        },
        getOptions() {
            const max = DataModel.getMaxSyllable();

            for (let i = 0; i < max + 1; i++) {
                const val = '' + i;
                const temp = { value: val, text: val };
                this.options.push(temp);
            }
        },
    },
});
</script>

<style scoped lang="scss">

</style>
