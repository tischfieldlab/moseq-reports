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
import { unnest } from '@/util/Vuex';
import mixins from 'vue-typed-mixins';
import LoadingMixin from './Core/LoadingMixin';
import WindowMixin from './Core/WindowMixin';

RegisterDataComponent({
    friendly_name: 'Selected Syllable',
    component_type: 'SelectedSyllable',
    init_width: 250,
    init_height: 155,
});

export default mixins(LoadingMixin, WindowMixin).extend({
    computed: {
        syllable(): number {
            return unnest(this.$store.state, this.datasource).selectedSyllable;
        },
    },
});
</script>

<style lang="scss" scoped>

</style>
