<template>
    <div>
        <template v-if="edit">
            <b-input
                :value="local_value"
                :size="size"
                @blur.native="onBlur"
                @keyup.enter.native="onBlur"
                v-focus="" />
        </template>
        <b-button
            v-else
            @click="edit = true;"
            title="Click to edit"
            variant="link"
            class="text-dark text-decoration-none">

            {{local_value}}
            <b-icon icon="pencil"></b-icon>
        </b-button>
    </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';


export default Vue.component('dataset-picker', {
    props: {
        value: {
            type: String,
        },
        size: {
            type: String as PropType<'sm'|'md'|'lg'>,
            default: 'md',
        },
    },
    data() {
        return {
            edit: false,
            local_value: this.value,
        };
    },
    watch: {
        value: {
            handler() {
                this.local_value = this.value;
            },
        },
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
            inserted(el) {
                el.focus();
            },
        },
    },
});
</script>

<style scoped>
.btn {
    padding: 0;
}
.b-icon {
    margin-left: 6px;
    width: 16px;
}
.b-button, .btn-link {
    color: inherit !important;
}
</style>
