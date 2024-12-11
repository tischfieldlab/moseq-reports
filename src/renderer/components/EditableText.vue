<template>
  <div>
    <template v-if="edit">
      <b-input
        :modelValue="local_value"
        :size="size"
        @update:modelValue="onInput"
        @blur="onBlur"
        @keyup.enter="onBlur"
        ref="input"
      />
    </template>
    <b-button @click="startEdit" title="Click to edit" variant="link" class="text-dark text-decoration-none">
      {{ local_value }}
      <!-- <i class="bi bi-pencil"></i> -->
    </b-button>
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

    // Watch for changes in the `modelValue` prop and update `local_value`
    watch(
      () => props.modelValue,
      (newValue) => {
        local_value.value = newValue;
      }
    );

    const startEdit = () => {
      edit.value = true;
      // Focus on the input element after it renders
      nextTick(() => inputRef.value?.focus());
    };

    const onInput = (newValue: string) => {
      local_value.value = newValue;
    };

    const onBlur = () => {
      edit.value = false;
      emit("update:modelValue", local_value.value);
    };

    return {
      edit,
      local_value,
      startEdit,
      onInput,
      onBlur,
      inputRef,
    };
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
.b-button,
.btn-link {
  color: inherit !important;
}
</style>
