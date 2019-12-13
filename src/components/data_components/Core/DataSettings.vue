<template>
    <b-form-group label="Data Source" label-class="font-weight-bold pt-0">
        <b-form-radio v-model="data_source" name="data_source" value="global">Use Global Filters</b-form-radio>
    </b-form-group>
</template>


<script lang="ts">
import Vue from 'vue';

export default Vue.component('data-settings', {
    props: {
        id: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            data_source: 'global',
        };
    },
});
</script>

<style scoped>

</style>