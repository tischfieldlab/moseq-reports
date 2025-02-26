<template>
  <BFormSelect :modelValue="value" @update:modelValue="onInput" :options="options"></BFormSelect>
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
      type: Object, 
      required: true,
    },
    filters: {
      type: Function,
      default: (item: any) => true, 
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
        .filter((item) => item !== undefined) 
        .filter(this.filters as (item: any) => boolean); 
    },
  },
  methods: {
    onInput(newValue: string) {
      this.$emit("update:value", newValue);
    },
  },
});
</script>

<style scoped></style>
