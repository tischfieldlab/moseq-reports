<template>
    <div class="content">
      <h3>Current Syllable</h3>
      <h5>{{ syllable }} ({{ countMethod }})</h5>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, computed } from "vue";
  import { useStore } from "vuex";
  import { RenderMode } from "@render/store/datawindow.types";
  import RegisterDataComponent from "@render/components/Core";
  import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";

  export default defineComponent({
    name: "SelectedSyllable",
    props: {
    id: {
      type: String,
      required: true,
    },
  },
    setup(props) {
      const store = useStore();
      const { dataview} = useWindowMixin(props.id);
      // Computed properties for syllable and countMethod
      const syllable = computed(() => dataview.value.selectedSyllable);
      const countMethod = computed(() => dataview.value.countMethod.toLowerCase());
  
      return {
        syllable,
        countMethod,
      };
    },
    components: {
      // Register data component logic if required
    },
  });
  RegisterDataComponent({
  friendly_name: "Selected Syllable",
  component_type: "SelectedSyllable",
  init_width: 260,
  init_height: 155,
  available_render_modes: [RenderMode.HTML],
  default_render_mode: RenderMode.HTML,
});
  </script>
  
  <style scoped>
  .content {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }
  </style>
  