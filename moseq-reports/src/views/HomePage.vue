<template>
    <div class='home' style='align-content: left; padding-left: 20px;'>
        <b-container style="float: left; margin-top: 10px;" class="bv-example-row">
            <b-row>
                <b-col><group-box></group-box></b-col>
                <b-col><heat-map></heat-map></b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import GroupBox from '@/components/GroupBox.vue';
import Heatmap from '@/components/Heatmap/Heatmap.vue';

export default Vue.extend({
    name: 'homepage',
    components: {
        'group-box': GroupBox,
        'heat-map': Heatmap,
    },
});
</script>

<style scoped lang="scss">

</style>
