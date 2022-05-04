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
        // Function for when the titlebar is clicked
        clicked: { type: Function },
        // Path to icon of titlebar button
        icon: { type: String, required: true },
    },
    methods: {
        buttonClick() {
            this.clicked();
        }
    }
});
</script>

<style scoped>
svg {
    width: 16px;
    height: 16px;
    cursor: pointer;
    color: #747474;
}

svg:hover {
    color: #3a3a3a;
}
</style>