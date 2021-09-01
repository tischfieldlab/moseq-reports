<template>
    <b-icon
        @click="buttonClick"
        :icon="this.icon"
    />
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'TitlebarButton',
    props: {
        clicked: { type: Function },
        icon: { type: String, required: true },
    },
    methods: {
        buttonClick() {
            // this.$props.clicked();
            this.clicked();
        }
    }
});
</script>

<style scoped>
</style>