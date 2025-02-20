<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <BInputGroup>
          <template #prepend>Group Ordering</template>
          <BFormSelect v-model="group_order_type" :options="group_order_options"></BFormSelect>
        </BInputGroup>
      </b-col>
    </b-row>

    <b-row v-show="group_order_type === 'dataset'">
      <b-col cols="1"></b-col>
      <b-col>
        <BInputGroup>
          <template #prepend>Dataset</template>
          <DatasetPicker v-model="group_order_dataset" :dataview="dataview" :owner="subid" />
        </BInputGroup>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <BInputGroup>
          <template #prepend>Point Size</template>
          <BFormInput type="number" v-model="point_size" :disabled="!show_points" min="1" max="10"></BFormInput>
          <BFormCheckbox v-model="show_points" switch class="ms-2">Show</BFormCheckbox>
        </BInputGroup>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <BInputGroup>
          <template #prepend>Boxplot Whiskers</template>
          <BFormSelect v-model="boxplot_whiskers" :options="whisker_options" :disabled="!show_boxplot"></BFormSelect>
          <BFormCheckbox v-model="show_boxplot" switch class="ms-2">Show</BFormCheckbox>
        </BInputGroup>
        <div class="figure-caption" v-html="boxplot_whisker_description"></div>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <BInputGroup>
          <template #prepend>Violin Scale</template>
          <BFormInput type="number" v-model="violin_kde_scale" :disabled="!show_violinplot" min="0" max="1.0" step="0.001"></BFormInput>
          <BFormCheckbox v-model="show_violinplot" switch class="ms-2">Show</BFormCheckbox>
        </BInputGroup>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";
import { WhiskerType } from "@render/components/Charts/BoxPlot";
import { OrderingType } from "@render/components/Charts/ClusteredHeatmap/ClusteredHeatmap.types";
import DatasetPicker from "@render/components/DatasetPicker.vue";
import { debounce } from "lodash"; // ✅ Import debounce to prevent excessive updates

export default defineComponent({
  name: "DetailedUsageOptions",
  props: {
    id: { type: String, required: true },
  },
  setup(props) {
    const store = useStore();
    const { settings, dataview } = useWindowMixin(props.id);

    // ✅ Ensure settings exist and provide safe defaults
    const safeSettings = computed(() => ({
      group_order_type: settings.value?.group_order_type || OrderingType.Natural,
      group_order_dataset: settings.value?.group_order_dataset || "",
      show_points: settings.value?.show_points ?? true,
      point_size: settings.value?.point_size ?? 2,
      show_boxplot: settings.value?.show_boxplot ?? true,
      boxplot_whiskers: settings.value?.boxplot_whiskers || WhiskerType.TUKEY,
      show_violinplot: settings.value?.show_violinplot ?? false,
      violin_kde_scale: settings.value?.violin_kde_scale ?? 0.01,
    }));

    // ✅ Prevent infinite loop in Vuex commits
    const group_order_type = computed({
      get: () => safeSettings.value.group_order_type,
      set: (value) => {
        if (value !== safeSettings.value.group_order_type) {
          store.commit(`${props.id}/updateComponentSettings`, {
            id: props.id,
            settings: { ...safeSettings.value, group_order_type: value },
          });
        }
      },
    });

    const group_order_dataset = computed({
      get: () => safeSettings.value.group_order_dataset,
      set: (value) => {
        if (value !== safeSettings.value.group_order_dataset) {
          store.commit(`${props.id}/updateComponentSettings`, {
            id: props.id,
            settings: { ...safeSettings.value, group_order_dataset: value },
          });
        }
      },
    });

    const point_size = ref<number>(safeSettings.value.point_size);

    // ✅ Debounced update for point size
    watch(
      point_size,
      debounce((newSize) => {
        if (newSize !== safeSettings.value.point_size) {
          store.commit(`${props.id}/updateComponentSettings`, {
            id: props.id,
            settings: { ...safeSettings.value, point_size: newSize },
          });
        }
      }, 300)
    );

    // ✅ Static options
    const whisker_options = ref([
      { value: WhiskerType.TUKEY, text: "Tukey", description: "Whiskers extend up to 1.5 * IQR from 25<sup>th</sup> and 75<sup>th</sup> percentile" },
      { value: WhiskerType.MIN_MAX, text: "Min/Max", description: "Whiskers extend to min and max data points" },
    ]);

    const group_order_options = ref([
      { text: "Filter Order", value: OrderingType.Natural },
      { text: "Dataset", value: OrderingType.Dataset },
    ]);

    const boxplot_whisker_description = computed(() => {
      return whisker_options.value.find((wo) => wo.value === safeSettings.value.boxplot_whiskers)?.description || "";
    });

    return {
      group_order_type,
      group_order_dataset,
      point_size,
      show_boxplot: computed(() => safeSettings.value.show_boxplot),
      show_points: computed(() => safeSettings.value.show_points),
      show_violinplot: computed(() => safeSettings.value.show_violinplot),
      violin_kde_scale: computed(() => safeSettings.value.violin_kde_scale),
      boxplot_whiskers: computed(() => safeSettings.value.boxplot_whiskers),
      boxplot_whisker_description,
      whisker_options,
      group_order_options,
      dataview,
    };
  },
});
</script>

<style scoped>
.row {
  margin: 10px 0;
}
</style>
