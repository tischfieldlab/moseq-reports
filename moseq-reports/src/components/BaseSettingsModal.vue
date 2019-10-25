<template>
    <div id="base-settings">
        <h4>Hi</h4>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
   name: 'base-settings',
   props: [
       'modal-header',
        'modal-body',
        'modal-footer',
   ],
});
</script>

<style lang="scss" scoped>

</style>
