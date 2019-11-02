<template>
    <div id='groupbox-container' style='padding-top: 15px; float: left;'>
        <b-card class="groups-header">
            <b-form-group style="text-align: left;">
                <h4>Group Selection</h4>
                <b-card-text>
                    <b-form-checkbox-group v-model='selected' :options='availableGroups'
                        @change='onChange($event)' stacked>
                    </b-form-checkbox-group>
                </b-card-text>
            </b-form-group>
            <br>
            <b-form-group style="text-align: left; margin-bottom: -15px;">
                <h4>Syllable Selection</h4>
                <b-card-text>
                    <b-form-select v-model="syllable" :options="options" @change="onSyllableChange($event)" class="mb-3">
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
    name: 'groupbox',
    data() {
        return {
            selected: DataModel.getSelectedGroups(),
            availableGroups: DataModel.getAvailableGroups(),
            syllable: DataModel.getSelectedSyllable(),
            options: [] as any,
        };
    },
    mounted() {
        DataModel.subscribe(EventType.SYLLABLE_CHANGE, this.updateSyllable);
        this.getOptions();
    },
    methods: {
        onChange(event: any) {
            DataModel.updateSelectedGroups(event);
        },
        updateSyllable(event: any) {
            this.syllable = DataModel.getSelectedSyllable();
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