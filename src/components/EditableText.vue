<template>
    <div>
        <template v-if="edit">
            <b-input
                :value="local_value"
                @blur.native="onBlur"
                @keyup.enter.native="onBlur"
                v-focus="" />
        </template>
        <span v-else @click="edit = true;" title="Click to edit">
            {{local_value}}
        </span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';


export default Vue.component('dataset-picker', {
    props: {
        value: {
            type: String,
        },
    },
    data() {
        return {
            edit: false,
            local_value: this.value,
        }
    },
    watch: {
        value: {
            handler() {
                this.local_value = this.value;
            }
        }
    },
    methods: {
        onInput(event) {
            this.$emit('input', event);
        },
        onBlur(event) {
            this.local_value = event.target.value;
            this.edit = false;
            this.$emit('input', this.local_value);
        },
    },
    directives: {
        focus: {
            inserted (el) {
                el.focus();
            },
        },
    },
});
</script>

<style scoped>
span {
    cursor: pointer;
}
</style>
