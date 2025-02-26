<template>
    <div style="overflow: hidden;">
      <template v-if="has_data">
        <!-- Pagination -->
        <BPagination
          v-if="num_examples > 0"
          v-model="example_num"
          :total-rows="num_examples"
          :per-page="1"
          :limit="num_examples"
          align="fill"
          :hide-goto-end-buttons="true"
          size="sm"
        ></BPagination>
  
        <!-- Spinogram Chart -->
        <svg :width="outsideWidth" :height="outsideHeight">
          <text class="title" :x="outsideWidth / 2" y="10">
            Module #{{ selectedSyllable }} ({{ countMethod }}) Spinogram
          </text>
  
          <g :transform="`translate(${margin.left}, ${dims.y - dims.h -10})`">
            <path
              v-for="(tp, idx) in spinogram_data"
              :key="idx"
              :d="lineGen(tp.xy)"
              :stroke="line_color"
              :stroke-width="line_weight"
              :style="{ opacity: tp.a }"
              :data-time="tp.t"
            />
          </g>
  
          <!-- Axes -->
          <g v-axis:x="scale" class="x-axis" :transform="`translate(${margin.left},${dims.y-10})`">
            <text class="label" :x="dims.w / 2" :y="35">
              Relative Lateral Position (mm)
            </text>
          </g>
          <g v-axis:y="scale" ref="yAxisRef" class="y-axis" :transform="`translate(${margin.left},${dims.y - dims.h-10 })`">
            <text class="label"
              transform="rotate(-90)"
              :y="-45"
              :x="0 - (dims.h / 2)"
              dy="1em">
              Height (mm)
            </text>
          </g>
  
          <!-- Color Legend -->
          <ColorScaleLegend
            title="Time (ms)"
            :scale="scale.t"
            :width="100"
            :height="10"
            :transform="`translate(${width}, 25)`"
          />
        </svg>
      </template>
  
      <!-- No Data Message -->
      <div v-else class="no-data">
        <BCard bg-variant="primary" text-variant="white" class="text-center">
          <BCardText>
            Sorry, there are no spinograms available for Syllable {{ selectedSyllable }} ({{ countMethod }})
          </BCardText>
        </BCard>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, watch, onMounted, nextTick } from "vue";
  import { useStore } from "vuex";
  import axios from "axios";
  import { useWindowMixin } from "@render/components/Core/Window/WindowMixin";
  import ColorScaleLegend from "@render/components/Charts/Colors/ColorScaleLegendSVG.vue";
  import { extent } from "d3-array";
  import * as d3 from "d3";
  import { scaleLinear, scaleSequential } from "d3-scale";
  import { line } from "d3-shape";
  import { rgb } from "d3-color";
  import RegisterDataComponent from "@render/components/Core";
  import { RenderMode } from "@render/store/datawindow.types";
  import { DirectiveBinding } from "vue";
  /** ✅ Define Interfaces */
  interface Spinogram {
    data: SpinogramTimepoint[];
  }
  
  interface SpinogramTimepoint {
    x: number[];
    y: number[];
    xy: number[][];
    a: number;
    t: number;
  }
  
  /** ✅ Register Spinogram Component */
  RegisterDataComponent({
    friendly_name: "Spinogram",
    component_type: "Spinogram",
    settings_type: "SpinogramOptions",
    init_width: 400,
    init_height: 300,
    available_render_modes: [RenderMode.SVG],
    default_render_mode: RenderMode.SVG,
    default_settings: {
      line_color: "#FF0000",
      line_weight: 2,
    },
  });
  
  export default defineComponent({
    name: "Spinogram",
    components: {
      ColorScaleLegend,
    },
    directives: {
    axis: {
      mounted(el: HTMLElement, binding: DirectiveBinding) {
        const axis = binding.arg;
        if (axis) {
          const axisMethod = { x: d3.axisBottom, y: d3.axisLeft }[axis];
          if (axisMethod) {
            d3.select(el).call(axisMethod(binding.value[axis]));
          }
        }
      },
    },
  },
    props: {
      id: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      // ✅ Vuex Store & Window Mixin
      const store = useStore();
      const { layout, dataview, settings } = useWindowMixin(props.id);
  
      // ✅ Data Fetching Variables
      const items = ref<Spinogram[]>([]);
      const example_num = ref(1);
      const serverAddress = computed(() => store.getters["server/getServerAddress"]);
  
      // ✅ Margins for SVG
      const margin = {
        top: 30,
        right: 20,
        bottom: 45,
        left: 45,
      };
  
      // ✅ Computed Properties
      const num_examples = computed(() => items.value.length);
      const selectedSyllable = computed(() => dataview.value.selectedSyllable);
      const countMethod = computed(() => dataview.value.countMethod);
      const has_data = computed(() => items.value.length > 0);
      const line_color = computed(() => settings.value.line_color);
      const line_weight = computed(() => settings.value.line_weight);
      const outsideWidth = computed(() => layout.value.width);
      const outsideHeight = computed(() => layout.value.height - 31);
      const width = computed(() => outsideWidth.value - margin.left - margin.right);
      const height = computed(() => outsideHeight.value - margin.top - margin.bottom);
  
      const dims = computed(() => ({
        w: width.value,
        h: height.value,
        x: margin.left,
        y: outsideHeight.value - margin.bottom,
      }));
  
      const legendHeight = computed(() => Math.min(150, Math.max(25, height.value * 0.75)));
  
      // ✅ Spinogram Data Extraction
      const spinogram_data = computed(() => {
        return example_num.value - 1 < items.value.length ? items.value[example_num.value - 1].data : [];
      });
  
      // ✅ D3 Scale Calculations
      const scale = computed(() => {
        if (!spinogram_data.value.length) {
          return { x: scaleLinear(), y: scaleLinear(), t: scaleSequential((n) => n) };
        }
  
        const x = scaleLinear().domain([0, 200]).rangeRound([0, dims.value.w]);
        const y = scaleLinear().domain([0, 100]).rangeRound([dims.value.h, 0]);
  
        const c = rgb(settings.value.line_color || "#FF0000");
        const ae = extent(spinogram_data.value.map((tp) => tp.a)) as [number, number];
        const te = extent(spinogram_data.value.map((tp) => tp.t)) as [number, number];
  
        const t = scaleSequential(d3.interpolateRgb(rgb(c.r, c.g, c.b, ae[0]).toString(), rgb(c.r, c.g, c.b, ae[1]).toString())).domain(te);
  
        return { x, y, t };
      });
  
      const lineGen = computed(() => line().x((d) => scale.value.x(d[0])).y((d) => scale.value.y(d[1])));
  
      const fetchSpinogramData = async () => {
        const datasetPath = store.getters["datasets/resolve"]("spinograms");
        const datasetOps = [
        { type: "map" },
        { 
            type: "filter", 
            filters: { 
                [`sid_${countMethod.value.toLowerCase()}`]: [selectedSyllable.value] 
            } 
        }
    ];
        try {
          const response = await axios.get(`${serverAddress.value}/load-usagedata`, {
            params: { path: datasetPath, operations: datasetOps, debug: false },
          });
          items.value = response.data.map((itm) => ({
            ...itm,
            data: itm.data.map((stp) => ({ ...stp, xy: stp.x.map((tpx, jdx) => [tpx, stp.y[jdx]]) })),
          }));
        } catch (error) {
          console.error("Error fetching Spinogram data:", error);
          items.value = [];
        }
      };
  
      watch(selectedSyllable, fetchSpinogramData, { immediate: true });

      return {
        example_num,
        items,
        spinogram_data,
        line_color,
        line_weight,
        legendHeight,
        num_examples,
        selectedSyllable,
        countMethod,
        has_data,
        scale,
        lineGen,
        layout,
        dims,
        width,
        height,
        outsideWidth,
        outsideHeight,
        margin,
      };
    },
  });
  </script>
  
<style scoped>
path {
    fill:none;
}
svg >>> g.x-axis text.label,
svg >>> g.y-axis text.label,
svg >>> text.title {
    text-anchor:middle;
    fill:#000;
    font-family: Verdana,Arial,sans-serif;
    font-size: 13px;
}
svg >>> g.legend text.label {
    font-size: 10px;
    transform: translateY(-10px);
}

svg {
    height: auto;
    width: auto;
}

.b-pagination {
    margin-bottom:0;
}
.no-data .card {
    width: 75%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>
  