<template>
  <Sankey
    :width="layout.width"
    :height="layout.height"
    :data="graph"
    :title="plotTitle"
    :colorLegendTitle="colorLegendTitle"
    :noDataMessage="noDataMessage"
    :tooltipFormatter="tooltipFormatter"
    :nodeIdSuperset="activeSyllables"
    :nodeAlignment="settings.node_alignment"
    :nodeWidth="settings.node_width"
    :nodePadding="settings.node_padding"
    :nodeColorMode="nodeColoring.mode"
    :nodeColorProperty="nodeColoring.prop"
    :linkColorMode="linkColoring.mode"
    :linkColorProperty="linkColoring.prop"
    :categoricalColormap="'schemeDark2'"
    :quantitativeColormap="settings.colorscale"
    @node-click="onNodeClick"
  />
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import RegisterDataComponent from '@render/components/Core';
import { useWindowMixin } from '@render/components/Core/Window/WindowMixin';
import Sankey from '@render/components/Charts/Sankey/Sankey.vue';
import { Node, Link, NodeAlignment, ColoringMode } from '@render/components/Charts/Sankey/Sankey.types';
import { RenderMode } from '@render/store/datawindow.types';
import axios from 'axios';
//import LoadingMixin  from '@render/components/Core/LoadingMixin';
//const { emitStartLoading, emitFinishLoading } = LoadingMixin();


RegisterDataComponent({
  friendly_name: 'Syllable Flow',
  component_type: 'SyllableFlow',
  settings_type: 'SyllableFlowOptions',
  init_width: 400,
  init_height: 500,
  available_render_modes: [RenderMode.SVG],
  default_render_mode: RenderMode.SVG,
  default_settings: {
    plot_group: '',
    show_relative_diff: false,
    relative_diff_group: '',
    prune_threshold: 0.0,
    colorscale: 'interpolatePuOr',
    node_padding: 3,
    node_width: 36,
    node_alignment: NodeAlignment.Justify,
  },
});

export default defineComponent({
  name: 'SyllableFlow',
  components: {
    Sankey,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { layout, dataview, datasource, settings } = useWindowMixin(props.id);

    const rawData = ref<{ group: string; row_id: number; col_id: number; raw: number }[]>([]);
    const isLoading = ref(false);
    const selectedSyllable = computed({
      get: () => dataview.selectedSyllable,
      set: (val: number) => {
        store.commit(`${datasource.value}/setSelectedSyllable`, val);
      },
    });

    const activeSyllables = computed(() => {
      return dataview.moduleIdFilter.length === 0
        ? store.getters[`${datasource.value}/availableModuleIds`]
        : dataview.moduleIdFilter;
    });

    const sourceData = computed(() => {
      const transSource = store.getters[`datasets/resolve`]('transitions');

      const relDiffGroup = settings.value.relative_diff_group;
      const filterGroups = settings.value.show_relative_diff
        ? [settings.value.plot_group, relDiffGroup]
        : [settings.value.plot_group];

      const transFilters = [
        {
          type: 'map',
          columns: [
            ['default_group', 'group'],
            [`row_id_${dataview.countMethod.toLowerCase()}`, 'row_id'],
            [`col_id_${dataview.countMethod.toLowerCase()}`, 'col_id'],
            'raw',
          ],
        },
        {
          type: 'filter',
          filters: {
            group: filterGroups,
          },
        },
        {
          type: 'aggregate',
          groupby: ['group', 'row_id', 'col_id'],
          aggregate: {
            raw: 'sum',
          },
        },
        {
          type: 'sort',
          columns: [
            ['row_id', 'asc'],
            ['col_id', 'asc'],
          ],
        },
      ];

      return {
        transitions: [transSource, transFilters],
        is_valid: filterGroups.filter((g) => g !== '' && g !== undefined).length > 0,
      };
    });

    watch(
  sourceData,
  async (s) => {
    if (!s || !s.is_valid) return;

    //emitStartLoading();

    try {
      const serverAddress = store.getters["server/getServerAddress"];
      const response = await axios.get(`${serverAddress}/load-usagedata`, {
        params: {
          path: s.transitions[0],
          operations: s.transitions[1],
          debug: false,
        },
      });
      console.log(response);
      rawData.value = response.data;
    } catch (err) {
      console.error("Failed to load transition data", err);
      rawData.value = [];
    } 
  },
  { immediate: true }
);
    onMounted(() => {
      if (!settings.value.plot_group) {
        store.commit(`${props.id}/updateComponentSettings`, {
          id: props.id,
          settings: {
            plot_group: dataview.selectedGroups[0],
          },
        });
      }
      if (!settings.value.relative_diff_group) {
        store.commit(`${props.id}/updateComponentSettings`, {
          id: props.id,
          settings: {
            relative_diff_group: dataview.selectedGroups[1],
          },
        });
      }
    });
  console.log(rawData)
    const graph = computed(() => {
      const trans = rawData.value.filter((row) => row.group === settings.value.plot_group);
      const transSum = trans.reduce((acc, curr) => acc + curr.raw, 0);
      const relTrans = rawData.value.filter((row) => row.group === settings.value.relative_diff_group);
      const relTransSum = relTrans.reduce((acc, curr) => acc + curr.raw, 0);

      const g = { nodes: [] as Node[], links: [] as Link[] };
      if (trans.length === 0 || (settings.value.show_relative_diff && relTrans.length === 0)) {
        return g;
      }

      g.nodes.push({
        type: 'node',
        id: selectedSyllable.value,
        name: selectedSyllable.value.toString(),
      });

      // Incoming links
      trans
        .filter((row) => row.col_id === selectedSyllable.value)
        .forEach((t) => {
          if (activeSyllables.value.includes(t.row_id) && t.row_id !== selectedSyllable.value) {
            const val = t.raw / transSum;
            if (val > settings.value.prune_threshold) {
              const inName = `in-${t.row_id}`;
              g.nodes.push({
                type: 'node',
                id: t.row_id,
                name: inName,
              });
              const relRow = relTrans.find(
                (r) => r.row_id === t.row_id && r.col_id === t.col_id
              );
              const relval = settings.value.show_relative_diff
                ? val - (relRow ? relRow.raw / relTransSum : 0)
                : val;
              g.links.push({
                type: 'edge',
                id: `${t.row_id} → ${selectedSyllable.value}`,
                color_id: t.row_id,
                source: inName,
                target: selectedSyllable.value.toString(),
                value: val,
                real_value: relval,
              });
            }
          }
        });

      // Outgoing links
      trans
        .filter((row) => row.row_id === selectedSyllable.value)
        .forEach((t) => {
          if (activeSyllables.value.includes(t.col_id) && t.col_id !== selectedSyllable.value) {
            const val = t.raw / transSum;
            if (val > settings.value.prune_threshold) {
              const outName = `out-${t.col_id}`;
              g.nodes.push({
                type: 'node',
                id: t.col_id,
                name: outName,
              });
              const relRow = relTrans.find(
                (r) => r.row_id === t.row_id && r.col_id === t.col_id
              );
              const relval = settings.value.show_relative_diff
                ? val - (relRow ? relRow.raw / relTransSum : 0)
                : val;
              g.links.push({
                type: 'edge',
                id: `${selectedSyllable.value} → ${t.col_id}`,
                color_id: t.col_id,
                source: selectedSyllable.value.toString(),
                target: outName,
                value: val,
                real_value: relval,
              });
            }
          }
        });

      return g;
    });

    const nodeColoring = computed(() => ({
      mode: ColoringMode.Categorical,
      prop: 'id',
    }));

    const linkColoring = computed(() => {
      if (settings.value.show_relative_diff) {
        return {
          mode: ColoringMode.Quantitative,
          prop: 'real_value',
        };
      } else {
        return {
          mode: ColoringMode.Categorical,
          prop: 'color_id',
        };
      }
    });

    const noDataMessage = computed(() => {
      return `No transitions for group ${settings.value.plot_group} Module ${selectedSyllable.value} (${dataview.countMethod})`;
    });

    const colorLegendTitle = computed(() => {
      if (settings.value.show_relative_diff) {
        return `TP(${settings.value.plot_group}) - TP(${settings.value.relative_diff_group})`;
      } else {
        return `TP(${settings.value.plot_group})`;
      }
    });

    const plotTitle = computed(() => {
      let title = settings.value.plot_group;
      if (settings.value.show_relative_diff) {
        title += ` vs ${settings.value.relative_diff_group}`;
      }
      return `${title} Module ${selectedSyllable.value} (${dataview.countMethod})`;
    });

    const tooltipFormatter = (hoverItem: Node | Link) => {
      if (hoverItem !== undefined) {
        if (hoverItem.type === 'node') {
          return `Module ${hoverItem.id}`;
        } else if (hoverItem.type === 'edge') {
          return `Transition ${hoverItem.id}<br />P(t) = ${hoverItem.real_value.toExponential(3)}`;
        }
      }
      return '';
    };

    const onNodeClick = (event: { value: { id: number } }) => {
      selectedSyllable.value = event.value.id;
    };

    return {
      layout,
      settings,
      graph,
      nodeColoring,
      linkColoring,
      noDataMessage,
      colorLegendTitle,
      plotTitle,
      tooltipFormatter,
      activeSyllables,
      onNodeClick,
    };
  },
});
</script>
