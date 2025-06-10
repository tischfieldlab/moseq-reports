<template>
    <div>
        <BContainer>
            <BRow>
                <BCol>
                    <BInputGroup prepend="Mode">
                        <BFormSelect v-model="plot_mode" :options="mode_options" />
                    </BInputGroup>
                </BCol>
            </BRow>
            <BRow v-show="plot_mode === TransitionsHeatmapMode.SingleGroup">
                <BCol cols="1" />
                <BCol>
                    <BInputGroup prepend="Group To Plot">
                        <BFormSelect v-model="group_to_plot" :options="group_options" />
                    </BInputGroup>
                </BCol>
            </BRow>
            <BRow>
                <BCol>
                    <BInputGroup prepend="Normalization">
                        <BFormSelect v-model="normalization" :options="normalization_options" />
                    </BInputGroup>
                </BCol>
            </BRow>
        </BContainer>
        <Colormap :id="id" />
        <RowOrdering :id="id" :column_options="syllable_options" />
        <ColumnOrdering :id="id" :row_options="syllable_options" />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { Colormap, ColumnOrdering, RowOrdering } from '@render/components/Charts/ClusteredHeatmap';
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";
import { TransitionsHeatmapMode, TransitionsHeatmapSettings, TransitionsNormalization } from "./TransitionsHeatmap.types";


const props = defineProps<{
    id: string;
}>();

const {$wstate, dataview} = useWindowMixin<TransitionsHeatmapSettings>(props.id);

const mode_options = [
    { text: "Overall", value: TransitionsHeatmapMode.Overall },
    { text: "Single Group", value: TransitionsHeatmapMode.SingleGroup },
];
const plot_mode = computed({
    get(): TransitionsHeatmapMode {
        return $wstate.settings.mode;
    },
    set(value: TransitionsHeatmapMode) {
        if (value !== $wstate.settings.mode) {
            $wstate.updateComponentSettings({
                settings: { mode: value },
            });
        }
    },
});

const group_options = computed((): {text: string, value: string}[] => {
    return dataview.value.selectedGroups.map((g) => ({text: g.toString(), value: g.toString()}));
});
const group_to_plot = computed({
    get(): string {
        return $wstate.settings.selected_group;
    },
    set(value: string) {
        if (value !== $wstate.settings.selected_group) {
            $wstate.updateComponentSettings({
                settings: { selected_group: value },
            });
        }
    },
});

const normalization_options = [
    { text: "Bigram", value: TransitionsNormalization.Bigram },
    { text: "Rows", value: TransitionsNormalization.Rows },
    { text: "Columns", value: TransitionsNormalization.Columns },
];
const normalization = computed({
    get(): TransitionsNormalization {
        return $wstate.settings.normalization;
    },
    set(value: TransitionsNormalization) {
        if (value !== $wstate.settings.normalization) {
            $wstate.updateComponentSettings({
                settings: { normalization: value },
            });
        }
    },
});


const syllable_options = computed((): {text: string, value: string}[] => {
    return dataview.value.selectedSyllables.map((g) => ({text: g.toString(), value: g.toString()}));
});


onMounted(() => {
    if ($wstate.settings.selected_group === '') {
        $wstate.updateComponentSettings({
            settings: { selected_group: dataview.value.selectedGroups[0] || '' },
        });
    }
});

</script>

<style scoped>

</style>