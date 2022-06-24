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
        },
        filters: {
            type: Function,
            default: ((item) => true) as (item: any) => boolean,
        },
        owner: {
            type: String,
        },
    },
    computed: {
        options(): {text: string, value: string}[] {
            return (Object.entries(this.dataview.views).map(([key, dset]) => {
                const parts = key.split('/');
                const win = this.$store.state.datawindows[parts[1]];
                if (win !== undefined && (this.owner !== undefined && this.owner !== parts[1])) {
                    return {
                        window: win,
                        text: `${win.title}: ${parts[2]}`,
                        value: key,
                    };
                } else {
                    return undefined;
                }
            })
            .filter((item) => item !== undefined) as {window: any, text: string, value: string}[])
            .filter(this.filters as (item: any) => boolean);
        },
    },
    methods: {
        onInput(event) {
            // Fire when the input is entered
            // @arg An event
            this.$emit('input', event);
        },
    },
});
</script>

<style scoped>

</style>
