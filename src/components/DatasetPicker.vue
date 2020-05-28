<template>
    <b-form-select :value="value" @input="onInput" :options="options"></b-form-select>
</template>

<script lang="ts">
import Vue from 'vue';


export default Vue.component('dataset-picker', {
    props: {
        value: {
            type: String,
        },
        dataview: {
            type: Object, // Dataview
        }
    },
    computed: {
        options(): {text: string, value: string}[] {
            return Object.entries(this.dataview.views).map(([key, dset]) => {
                const parts = key.split('/');
                const win = this.$store.state.datawindows[parts[1]];
                if (win !== undefined) {
                    return {
                        text: `${win.title}: ${parts[2]}`,
                        value: key,
                    };
                } else {
                    return undefined;
                }
            }).filter((item) => item !== undefined) as {text: string, value: string}[];
        },
    },
    methods: {
        onInput(event) {
            this.$emit('input', event);
        },
    },
});
</script>

<style scoped>

</style>
