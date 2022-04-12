<template>
    <b-button v-b-tooltip.hover :title="title" class="title-button" size="sm" variant="link" @click="clicked">
        <b-icon
            :icon="this.icon" 
        />
    </b-button>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'TitlebarButton',
    props: {
        /* tslint:disable-next-line */
        clicked: { type: Function, required: false, default: () => {} },
        icon: { type: String, required: true },
        title: { type: String, required: false }
    },
});
</script>

<style scoped>

.title-button {
    width: 24px;
    height: 24px;
    color: #747474;
    padding: 5px;
    margin-right: 1px;
}

.title-button:hover {
    color:#3a3a3a;
}

.title-button:focus, title-button:active {
    outline: none !important;
    box-shadow: none;
}

</style>