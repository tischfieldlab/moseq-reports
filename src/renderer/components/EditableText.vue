<template>
    <div>
        <template v-if="edit">
            <b-input
                v-model="local_value"
                :size="size"
                @blur="onBlur"
                @keyup.enter="onBlur"
                ref="input"
                class="inline-edit-input"
            />
        </template>
        <template v-else>
            <span class="editable-text" @click="startEdit" title="Click to edit">
                {{ local_value }}
                <i class="bi bi-pencil"></i>
            </span>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch, nextTick } from "vue";

export default defineComponent({
    props: {
        modelValue: {
            type: String,
            required: true,
        },
        size: {
            type: String as PropType<"sm" | "md" | "lg">,
            default: "md",
        },
    },
    setup(props, { emit }) {
        const edit = ref(false);
        const local_value = ref(props.modelValue);
        const inputRef = ref<HTMLInputElement | null>(null);

        watch(
            () => props.modelValue,
            (newValue) => {
                local_value.value = newValue;
            }
        );

        const startEdit = () => {
            edit.value = true;
            nextTick(() => inputRef.value?.focus());
        };

        const onBlur = () => {
            edit.value = false;
            emit("update:modelValue", local_value.value);
        };

        return {
            edit,
            local_value,
            startEdit,
            onBlur,
            inputRef,
        };
    },
});
</script>

<style scoped>
.editable-text {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
}

.inline-edit-input {
    display: inline-block;
    width: auto;
    min-width: 100px;
}

.bi-pencil {
    margin-left: 6px;
}
</style>
