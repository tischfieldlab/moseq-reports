<template>
    <div class='home' style='align-content: left; padding-left: 20px;'>
        <group-box></group-box>
        <heat-map></heat-map>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import GroupBox from '@/components/GroupBox.vue';
import Heatmap from '@/components/Heatmap.vue';

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
