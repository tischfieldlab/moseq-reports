<template>
    <div>
        <BRow>
            <BCol>
                <BInputGroup prepend="Behavioral Distance Metric">
                    <BFormSelect v-model="distance_metric" :options="method_options" />
                </BInputGroup>
            </BCol>
        </BRow>
        <Colormap :id="id" />
        <RowOrdering :id="id" :column_options="syllable_options" />
        <ColumnOrdering :id="id" :row_options="syllable_options" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import Colormap from '@render/components/Charts/ClusteredHeatmap/Options/Colormap.vue';
import ColumnOrdering from '@render/components/Charts/ClusteredHeatmap/Options/ColumnOrdering.vue';
import RowOrdering from '@render/components/Charts/ClusteredHeatmap/Options/RowOrdering.vue';
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";
import { BehavioralDistanceHeatmapSettings } from "./BehavioralDistanceHeatmap.types";
import DataService from "@render/api";


const props = defineProps<{
    id: string;
}>();

const {$wstate, dataview} = useWindowMixin<BehavioralDistanceHeatmapSettings>(props.id);


const method_options = ref<string[]>([]);
const syllable_options = computed((): {text: string, value: string}[] => {
    let vals;
    if (dataview.moduleIdFilter.length === 0) {
        vals = dataview.availableModuleIds;
    } else {
        vals = dataview.moduleIdFilter;
    }
    return vals.map((g) => ({text: g.toString(), value: g.toString()}));
});
// Setting for distance metric of the Heatmap. If changed, it will send a signal for the store to commit the `updateComponentSettings` mutation.
const distance_metric = computed({
    get(): string {
        return $wstate.settings.distance_metric;
    },
    set(value: string) {
        $wstate.updateComponentSettings({
            settings: {
                distance_metric: value,
            },
        });
    },
});

watchEffect(async () => {
    DataService.fetchData<any>('behave_dist', [{ type: 'pluck', column: 'columns' }])
        .then((data) => {
            console.log('Behavioral Distance Heatmap Options', data); 
            method_options.value = data.filter((itm) => !itm.startsWith('row') && !itm.startsWith('col'));
        });
});
</script>

<style scoped>
.row{
    margin:10px 0;
}
</style>