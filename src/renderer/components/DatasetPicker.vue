<template>
  <b-form-select :modelValue="value" @update:modelValue="onInput" :options="options"></b-form-select>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    value: {
      type: String,
      required: true,
    },
    dataview: {
      type: Object, // This should align with the Dataview type definition
      required: true,
    },
    filters: {
      type: Function,
      default: (item: any) => true, // Default filter function allows all items
    },
    owner: {
      type: String,
      default: "",
    },
  },
  computed: {
    options(): { text: string; value: string }[] {
      return Object.entries(this.dataview.views)
        .map(([key, dset]) => {
          const parts = key.split("/");
          const win = this.$store.state.datawindows[parts[1]];
          if (win && this.owner && this.owner !== parts[1]) {
            return {
              window: win,
              text: `${win.title}: ${parts[2]}`,
              value: key,
            };
          }
          return undefined;
        })
        .filter((item) => item !== undefined) // Filter out undefined items
        .filter(this.filters as (item: any) => boolean); // Apply user-defined filters
    },
  },
  methods: {
    onInput(newValue: string) {
      // Emit the updated value when the user selects an option
      this.$emit("update:value", newValue);
    },
  },
});
</script>

<style scoped></style>
