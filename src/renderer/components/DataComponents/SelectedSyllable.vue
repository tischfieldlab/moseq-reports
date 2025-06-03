<template>
    <div class="content">
      <h3>Current Syllable</h3>
      <h5>{{ syllable }} ({{ countMethod }})</h5>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { RenderMode } from "@store/datawindow.types";
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
        const { dataview} = useWindowMixin(props.id);
        const syllable = computed(() => dataview.value.selectedSyllable);
        const countMethod = computed(() => dataview.value.countMethod.toLowerCase());

        return {
            syllable,
            countMethod,
        };
    },
});
RegisterDataComponent({
    friendly_name: "Selected Syllable",
    component_type: "SelectedSyllable",
    init_width: 270,
    init_height: 155,
    available_render_modes: [RenderMode.HTML],
    default_render_mode: RenderMode.HTML,
});
</script>

<style scoped>
.content {
    display: flex;
    align-content: center;
    flex-wrap: wrap;
    height: 100%;
}
.content h3,
.content h5 {
    width: 100%;
    text-align: center;
}
</style>
