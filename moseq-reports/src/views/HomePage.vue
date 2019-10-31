<template>
    <div class='home'>
        <b-container fluid style="margin-top: 10px;" class="bv-example-row">
            <b-row>
                <b-col>
                    <group-box></group-box>
                </b-col>
                <b-col>
                    <JqxDocking orientation="horizontal" width="100%" mode="floating">
                        <div>
                            <UiCard>
                                Heatmap
                                <heat-map slot="body"></heat-map>
                            </UiCard>
                            <UiCard>
                                <test-syllable slot="body"></test-syllable>
                            </UiCard>
                        </div>
                    </JqxDocking>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import UiCard from '@/components/Window.vue';

import JqxDocking from "jqwidgets-scripts/jqwidgets-vue/vue_jqxdocking.vue";
import JqxDockingLayout from "jqwidgets-scripts/jqwidgets-vue/vue_jqxdockinglayout.vue";

import GroupBox from '@/components/GroupBox.vue';
import Heatmap from '@/components/Heatmap/Heatmap.vue';
import TestSyllable from '@/components/TestSyllable.vue';

export default Vue.extend({
    name: 'homepage',
    components: {
        JqxDocking,
        UiCard,
        'group-box': GroupBox,
        'heat-map': Heatmap,
        'test-syllable': TestSyllable,
    },
});
</script>

<style scoped lang="scss">

</style>
