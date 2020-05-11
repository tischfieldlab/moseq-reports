<template>
    <div class="content">
        <h3>Current Syllable</h3>
        <h5>{{ this.syllable }} ({{this.countMethod}})</h5>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/Core';
import mixins from 'vue-typed-mixins';
import LoadingMixin from '@/components/Core/LoadingMixin';
import WindowMixin from '@/components/Core/WindowMixin';

RegisterDataComponent({
    friendly_name: 'Selected Syllable',
    component_type: 'SelectedSyllable',
    init_width: 250,
    init_height: 155,
});

export default mixins(LoadingMixin, WindowMixin).extend({
    computed: {
        syllable(): number {
            return this.dataview.selectedSyllable;
        },
        countMethod(): string {
            return this.dataview.countMethod.toLowerCase();
        },
    },
});
</script>

<style scoped>
.content {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    text-align: center;
}
</style>
