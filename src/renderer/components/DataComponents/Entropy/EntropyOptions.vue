<template>
    <BContainer fluid>
        <BRow>
            <BCol>
                <BInputGroup>
                    <template #prepend>
                        <BInputGroupText>Metric</BInputGroupText>
                    </template>
                    <BFormSelect v-model="entropy_metric" :options="entropy_type_options" />
                </BInputGroup>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <BInputGroup>
                    <template #prepend>
                        <BInputGroupText>Group Ordering</BInputGroupText>
                    </template>
                    <BFormSelect v-model="group_order_type" :options="group_order_options" />
                </BInputGroup>
            </BCol>
        </BRow>

        <BRow v-show="group_order_type === 'dataset'">
            <BCol cols="1"></BCol>
            <BCol>
                <BInputGroup>
                    <template #prepend>
                        <BInputGroupText>Dataset</BInputGroupText>
                    </template>
                    <DatasetPicker v-model="group_order_dataset" :dataview="datasource" :owner="id" />
                </BInputGroup>
            </BCol>
        </BRow>

        <BRow>
            <BCol>
                <BInputGroup>
                    <template #prepend>
                        <BInputGroupText>Point Size</BInputGroupText>
                    </template>
                    <BFormInput type="number" v-model="point_size" :disabled="!show_points" min="1" max="10">
                    </BFormInput>
                    <template #append>
                        <BInputGroupText>
                            <BFormCheckbox v-model="show_points" switch class="ms-2" />
                        </BInputGroupText>
                    </template>
                </BInputGroup>
            </BCol>
        </BRow>

        <BRow>
            <BCol>
                <BInputGroup>
                    <template #prepend>
                        <BInputGroupText>Boxplot Whiskers</BInputGroupText>
                    </template>
                    <BFormSelect v-model="boxplot_whiskers" :options="whisker_options" :disabled="!show_boxplot" />
                    <template #append>
                        <BInputGroupText>
                            <BFormCheckbox v-model="show_boxplot" switch class="ms-2" />
                        </BInputGroupText>
                    </template>
                </BInputGroup>
                <div class="figure-caption" v-html="boxplot_whisker_description"></div>
            </BCol>
        </BRow>

        <BRow>
            <BCol>
                <BInputGroup>
                    <template #prepend>
                        <BInputGroupText>Violin Scale</BInputGroupText>
                    </template>
                    <BFormInput type="number" v-model="violin_kde_scale" :disabled="!show_violinplot" min="0" max="1.0"
                        step="0.001"></BFormInput>
                    <template #append>
                        <BInputGroupText>
                            <BFormCheckbox v-model="show_violinplot" switch class="ms-2" />
                        </BInputGroupText>
                    </template>
                </BInputGroup>
            </BCol>
        </BRow>
    </BContainer>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";
import { WhiskerType } from "@render/components/Charts/BoxPlot";
import { OrderingType } from "@render/components/Charts/ClusteredHeatmap";
import { EntropySettings, availableMetrics } from "./Entropy.types";
import DatasetPicker from "@render/components/DatasetPicker.vue";

export default defineComponent({
    name: "DetailedUsageOptions",
    components: {
        DatasetPicker,
    },
    props: {
        id: {
            type: String,
            required: true
        },
    },
    setup(props) {
        const { settings, datasource, $wstate } = useWindowMixin<EntropySettings>(props.id);

        const entropy_type_options = Object.entries(availableMetrics).map(([metric, info]) => ({value: metric, text: info.title}))

        const entropy_metric = computed({
            get: () => settings.value.entropy_metric,
            set: (value) => {
                if (value !== settings.value.group_order_type) {
                    $wstate.updateComponentSettings({
                        settings: { entropy_metric: value },
                    });
                }
            },
        });

        const group_order_type = computed({
            get: () => settings.value.group_order_type,
            set: (value) => {
                if (value !== settings.value.group_order_type) {
                    $wstate.updateComponentSettings({
                        settings: { group_order_type: value },
                    });
                }
            },
        });

        const group_order_dataset = computed({
            get: () => settings.value.group_order_dataset,
            set: (value) => {
                if (value !== settings.value.group_order_dataset) {
                    $wstate.updateComponentSettings({
                        settings: { group_order_dataset: value },
                    });
                }
            },
        });

        const show_points = computed({
            get: () => settings.value.show_points,
            set: (value) => {
                if (value !== settings.value.show_points) {
                    $wstate.updateComponentSettings({
                        settings: { show_points: value },
                    });
                }
            },
        });
        const point_size = computed({
            get: () => settings.value.point_size,
            set: (value) => {
                if (value !== settings.value.point_size) {
                    $wstate.updateComponentSettings({
                        settings: { point_size: value },
                    });
                }
            },
        });

        const show_boxplot = computed({
            get: () => settings.value.show_boxplot,
            set: (value) => {
                if (value !== settings.value.show_boxplot) {
                    $wstate.updateComponentSettings({
                        settings: { show_boxplot: value },
                    });
                }
            },
        });

        const boxplot_whiskers = computed({
            get: () => settings.value.boxplot_whiskers,
            set: (value) => {
                if (value !== settings.value.boxplot_whiskers) {
                    $wstate.updateComponentSettings({
                        settings: { boxplot_whiskers: value },
                    });
                }
            },
        });

        const show_violinplot = computed({
            get: () => settings.value.show_violinplot,
            set: (value) => {
                if (value !== settings.value.show_violinplot) {
                    $wstate.updateComponentSettings({
                        settings: { show_violinplot: value },
                    });
                }
            },
        });

        const violin_kde_scale = computed({
            get: () => settings.value.violin_kde_scale,
            set: (value) => {
                if (value !== settings.value.violin_kde_scale) {
                    $wstate.updateComponentSettings({
                        settings: { violin_kde_scale: value },
                    });
                }
            },
        });

        const whisker_options = ref([
            { value: WhiskerType.TUKEY, text: "Tukey", description: "Whiskers extend up to 1.5 * IQR from 25<sup>th</sup> and 75<sup>th</sup> percentile" },
            { value: WhiskerType.MIN_MAX, text: "Min/Max", description: "Whiskers extend to min and max data points" },
        ]);

        const group_order_options = ref([
            { text: "Filter Order", value: OrderingType.Natural },
            { text: "Dataset", value: OrderingType.Dataset },
        ]);

        const boxplot_whisker_description = computed(() => {
            return whisker_options.value.find((wo) => wo.value === settings.value.boxplot_whiskers)?.description || "";
        });

        return {
            entropy_type_options,
            entropy_metric,
            group_order_type,
            group_order_dataset,
            point_size,
            show_boxplot,
            show_points,
            show_violinplot,
            violin_kde_scale,
            boxplot_whiskers,
            boxplot_whisker_description,
            whisker_options,
            group_order_options,
            datasource,
        };
    },
});
</script>

<style scoped>
.row {
    margin: 10px 0;
}
</style>
