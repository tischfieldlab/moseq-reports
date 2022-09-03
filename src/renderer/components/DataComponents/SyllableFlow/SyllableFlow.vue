<template>
  <sankey
    :width="layout.width"
    :height="layout.height"
    :data="graph"
    :title="plotTitle"
    :colorLegendTitle="colorLegendTitle"
    :noDataMessage="noDataMessage"
    :tooltipFormatter="tooltip_formatter"
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
import Vue from "vue";
import RegisterDataComponent from "@render/components/Core";
import mixins from "vue-typed-mixins";
import LoadingMixin from "@render/components/Core/LoadingMixin";
import WindowMixin from "@render/components/Core/Window/WindowMixin";
import LoadData from "@render/components/Core/DataLoader/DataLoader";

import Sankey from "@render/components/Charts/Sankey/Sankey.vue";
import { Node, Link, NodeAlignment, ColoringMode } from "@render/components/Charts/Sankey/Sankey.types";
import { RenderMode } from "@render/store/datawindow.types";

RegisterDataComponent({
  friendly_name: "Syllable Flow",
  component_type: "SyllableFlow",
  settings_type: "SyllableFlowOptions",
  init_width: 400,
  init_height: 500,
  available_render_modes: [RenderMode.SVG],
  default_render_mode: RenderMode.SVG,
  default_settings: {
    plot_group: "",
    show_relative_diff: false,
    relative_diff_group: "",
    prune_threshold: 0.0,
    colorscale: "interpolatePuOr",
    node_padding: 3,
    node_width: 36,
    node_alignment: NodeAlignment.Justify,
  },
});

function default_tooltip_formatter(hoverItem, that) {
  if (hoverItem !== undefined) {
    let hi = hoverItem as Node | Link;
    if (hi.type === "node") {
      return `Module ${hi.id}`;
    } else if (hi.type === "edge") {
      hi = hi as Link;
      return `Transition ${hi.id}<br />P(t) = ${hi.real_value.toExponential(3)}`;
    }
  }
  return "";
}

export default mixins(WindowMixin, LoadingMixin).extend({
  components: {
    Sankey,
  },
  data() {
    return {
      raw_data: [] as { group: string; row_id: number; col_id: number; raw: number }[],
    };
  },
  watch: {
    sourceData: {
      handler(s) {
        if (s === undefined || !s.is_valid) {
          return;
        }
        this.emitStartLoading();
        // LoadData(s.transitions[0], s.transitions[1], false)
        //   .then((data) => (this.raw_data = data))
        //   .then(() => this.emitFinishLoading());
      },
      immediate: true,
    },
  },
  created() {
    if (this.settings.plot_group === undefined || this.settings.plot_group === "") {
      this.$store.commit(`${this.id}/updateComponentSettings`, {
        id: this.id,
        settings: {
          plot_group: this.dataview.selectedGroups[0],
        },
      });
    }
    if (this.settings.relative_diff_group === undefined || this.settings.relative_diff_group === "") {
      this.$store.commit(`${this.id}/updateComponentSettings`, {
        id: this.id,
        settings: {
          relative_diff_group: this.dataview.selectedGroups[1],
        },
      });
    }
  },
  computed: {
    nodeColoring() {
      return {
        mode: ColoringMode.Categorical,
        prop: "id",
      };
    },
    linkColoring() {
      if (this.settings.show_relative_diff) {
        return {
          mode: ColoringMode.Quantitative,
          prop: "real_value",
        };
      } else {
        return {
          mode: ColoringMode.Categorical,
          prop: "color_id",
        };
      }
    },
    noDataMessage(): string {
      return (
        `No transitions for group ${this.settings.plot_group} ` +
        `Module ${this.selectedSyllable} (${this.dataview.countMethod})`
      );
    },
    colorLegendTitle(): string {
      if (this.settings.show_relative_diff) {
        return `TP(${this.settings.plot_group}) - TP(${this.settings.relative_diff_group})`;
      } else {
        return `TP(${this.settings.plot_group})`;
      }
    },
    plotTitle(): string {
      let title = this.settings.plot_group;
      if (this.settings.show_relative_diff) {
        title += ` vs ${this.settings.relative_diff_group}`;
      }
      return title + ` Module ${this.selectedSyllable} (${this.dataview.countMethod})`;
    },
    sourceData(): any {
      const transSource = this.$store.getters[`datasets/resolve`]("transitions");

      const relDiffGroup = this.settings.relative_diff_group;
      const filterGroups = [
        ...(this.settings.show_relative_diff ? [this.settings.plot_group, relDiffGroup] : [this.settings.plot_group]),
      ];

      const transFilters = [
        {
          type: "map",
          columns: [
            ["default_group", "group"],
            [`row_id_${this.dataview.countMethod.toLowerCase()}`, "row_id"],
            [`col_id_${this.dataview.countMethod.toLowerCase()}`, "col_id"],
            "raw",
          ],
        },
        {
          type: "filter",
          filters: {
            group: filterGroups,
          },
        },
        {
          type: "aggregate",
          groupby: ["group", "row_id", "col_id"],
          aggregate: {
            raw: "sum",
          },
        },
        {
          type: "sort",
          columns: [
            ["row_id", "asc"],
            ["col_id", "asc"],
          ],
        },
      ];
      return {
        transitions: [transSource, transFilters],
        is_valid: filterGroups.filter((g) => g !== "" && g !== undefined).length > 0,
      };
    },
    graph(): { nodes: Node[]; links: Link[] } {
      const trans = this.raw_data.filter((row) => row.group === this.settings.plot_group);
      const transSum = trans.reduce((acc, curr) => acc + curr.raw, 0);
      const relTrans = this.raw_data.filter((row) => row.group === this.settings.relative_diff_group);
      const relTransSum = relTrans.reduce((acc, curr) => acc + curr.raw, 0);

      const g = { nodes: [] as Node[], links: [] as Link[] };
      if (trans === undefined || trans.length === 0) {
        return g;
      }
      if (this.settings.show_relative_diff && (relTrans === undefined || relTrans.length === 0)) {
        return g;
      }
      // the central node
      g.nodes.push({
        type: "node",
        id: this.selectedSyllable,
        name: this.selectedSyllable.toString(),
      });

      // incoming links
      for (const [i, t] of trans.filter((row) => row.col_id === this.selectedSyllable).entries()) {
        if (this.activeSyllables.includes(t.row_id) && t.row_id !== this.selectedSyllable) {
          const val = t.raw / transSum;
          if (val > this.settings.prune_threshold) {
            const inName = `in-${t.row_id}`;
            g.nodes.push({
              type: "node",
              id: t.row_id,
              name: inName,
            });
            const relval = this.settings.show_relative_diff
              ? t.raw / transSum - relTrans[i].raw / relTransSum
              : t.raw / transSum;
            g.links.push({
              type: "edge",
              id: `${t.row_id} → ${this.selectedSyllable}`,
              color_id: t.row_id,
              source: inName,
              target: this.selectedSyllable.toString(),
              value: val,
              real_value: relval,
            });
          }
        }
      }
      // outgoing links
      for (const [i, t] of trans.filter((row) => row.row_id === this.selectedSyllable).entries()) {
        if (this.activeSyllables.includes(t.col_id) && t.col_id !== this.selectedSyllable) {
          const val = t.raw / transSum;
          if (val > this.settings.prune_threshold) {
            const outName = `out-${t.col_id}`;
            g.nodes.push({
              type: "node",
              id: t.col_id,
              name: outName,
            });
            const relval = this.settings.show_relative_diff
              ? t.raw / transSum - relTrans[i].raw / relTransSum
              : t.raw / transSum;
            g.links.push({
              type: "edge",
              id: `${this.selectedSyllable} → ${t.col_id}`,
              color_id: t.col_id,
              source: this.selectedSyllable.toString(),
              target: outName,
              value: val,
              real_value: relval,
            });
          }
        }
      }
      return g;
    },
    activeSyllables(): number[] {
      if (this.dataview.moduleIdFilter.length === 0) {
        return this.$store.getters[`${this.datasource}/availableModuleIds`];
      } else {
        return this.dataview.moduleIdFilter;
      }
    },
    selectedSyllable: {
      get(): number {
        return this.dataview.selectedSyllable;
      },
      set(event: number) {
        this.$store.commit(`${this.datasource}/setSelectedSyllable`, event);
      },
    },
  },
  methods: {
    tooltip_formatter(hoverItem, that) {
      if (hoverItem !== undefined) {
        let hi = hoverItem as Node | Link;
        if (hi.type === "node") {
          return `Module ${hi.id}`;
        } else if (hi.type === "edge") {
          hi = hi as Link;
          return `Transition ${hi.id}<br />P(t) = ${hi.real_value.toExponential(3)}`;
        }
      }
      return "";
    },
    onNodeClick(event) {
      this.selectedSyllable = event.value.id;
    },
  },
});
</script>
