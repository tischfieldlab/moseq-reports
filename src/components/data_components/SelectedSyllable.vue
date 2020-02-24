<template>
    <b-card title="Current Syllable">
        <b-card-text>
            <h5 style="text-align:center;">{{ this.syllable }}</h5>
        </b-card-text>
    </b-card>
</template>

<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/data_components/Core';

RegisterDataComponent({
    friendly_name: 'Selected Syllable',
    component_type: 'selected-syllable',
    init_width: 250,
    init_height: 155,
});

export default Vue.component('selected-syllable', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    computed: {
        syllable(): number {
            return this.$store.state.dataview.selectedSyllable;
        },
    },
});
</script>

<style lang="scss" scoped>

</style>
