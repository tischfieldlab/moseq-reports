<template>
    <div id='groupbox-container' style=''>
        <b-card no-body>
            <b-card-header>Group Selection</b-card-header>
            <b-card-body>
                <b-form-checkbox-group v-model='selected' :options='availableGroups'
                    @change='onChange($event)' stacked>
                </b-form-checkbox-group>
            </b-card-body>
        </b-card>
        <b-card no-body>
            <b-card-header>Syllable Selection</b-card-header>
            <b-card-body>
                <b-form-select v-model="syllable" :options="options" @change="onSyllableChange($event)">
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
.card{
    margin:10px;
}
.card-header{
    font-weight: bold;
}
.card-body{
    text-align: left;
}
</style>