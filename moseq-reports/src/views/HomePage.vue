<template>
    <div class='home'>
        <b-container fluid style="margin-top: 10px;" class="bv-example-row">
            <b-row>
                <b-col>
                    <group-box></group-box>
                </b-col>
                <b-col>
                    <heat-map></heat-map>
                </b-col>
                <b-col><test-syllable></test-syllable></b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import GroupBox from '@/components/GroupBox.vue';
import Heatmap from '@/components/Heatmap/Heatmap.vue';
import TestSyllable from '@/components/TestSyllable.vue';

export default Vue.extend({
    name: 'homepage',
    components: {
        'group-box': GroupBox,
        'heat-map': Heatmap,
        'test-syllable': TestSyllable,
    },
});
</script>

<style scoped lang="scss">

</style>
