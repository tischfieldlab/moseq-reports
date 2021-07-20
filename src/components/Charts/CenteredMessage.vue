<template>
    <div v-if="show" class="centered-message">
        <b-card bg-variant="primary" text-variant="white" class="text-center">
            <b-card-text>
                <slot></slot>
            </b-card-text>
        </b-card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';


export default Vue.extend({
    props: {
        show: {
            type: Boolean,
            default: true,
        },
    },
});
</script>

<style scoped>
.centered-message .card {
    width: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>