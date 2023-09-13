<template>
  <div class="sankey-container">
    <svg :width="width" :height="height" @mousemove="debouncedHover" @mouseout="hoverItem = undefined">
      <template v-if="graph.nodes.length > 0 && graph.links.length > 0">
        <text class="axis-label" :transform="`translate(${width / 2}, 15)`">
          {{ title }}
        </text>
        <g>
          <text class="axis-label" :transform="`translate(10, ${innerHeight / 2 + margin.top}) rotate(-90)`">
            Incoming
          </text>
          <text
            class="axis-label"
            :transform="`translate(${width - margin.right / 2}, ${innerHeight / 2 + margin.top}) rotate(-90)`"
          >
            Outgoing
          </text>
          <g
            class="node"
            v-for="n in graph.nodes"
            :key="n.name"
            :transform="`translate(${(n.x0 || 0) + 1}, ${n.y0 || 0})`"
            @click="onNodeClick($event, n)"
            :data-nodeid="n.id"
          >
            <rect
              :x="0"
              :y="0"
              :width="n.x1 - n.x0 - 2 || 0"
              :height="Math.max(1, n.y1 - n.y0) || 0"
              :fill="color(scale.n(n[nodeColorProperty])).darker(0.5)"
              :data-nodeid="n.id"
            ></rect>
            <text
              v-if="Math.max(1, n.y1 - n.y0) > 10"
              class="node-label"
              :x="(n.x1 - n.x0 - 2) / 2"
              :y="Math.max(1, n.y1 - n.y0) / 2"
              :data-nodeid="n.id"
            >
              {{ n.id }}
            </text>
          </g>
        </g>
        <g>
          <template v-for="l in graph.links">
            <path
              :key="l.id"
              class="link"
              :d="sankeyLinkHorizontal(l)"
              fill="none"
              :stroke="scale.l(l)"
              :stroke-width="Math.max(1, l.width)"
              :data-transitionid="l.id"
              @click="onEdgeClick($event, l)"
            ></path>
          </template>
        </g>
        <ColorScaleLegend
          v-if="showColorLegend"
          :title="colorLegendTitle"
          :scale="scale.li"
          :width="150"
          :height="10"
          :transform="`translate(${width / 2}, ${height - margin.bottom})`"
        />
      </template>
    </svg>
    <div v-if="graph.links.length === 0" class="no-data">
      <b-card bg-variant="primary" text-variant="white" class="text-center">
        <b-card-text>{{ noDataMessage }}</b-card-text>
      </b-card>
    </div>
    <ToolTip :position="tooltipPosition" :show="hoverItem !== undefined">
      <div v-html="tooltip_text" style="text-align: left"></div>
    </ToolTip>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import { Node, Link, NodeAlignment, ColoringMode } from "@render/components/Charts/Sankey/Sankey.types";
import { sankey, sankeyCenter, sankeyLeft, sankeyRight, sankeyJustify } from "d3-sankey";
import { linkHorizontal } from "d3-shape";
import { color } from "d3-color";
import { GetScale } from "@render/components/Charts/Colors/D3ColorProvider";
import { scaleOrdinal, scaleDiverging } from "d3-scale";
import { max } from "d3-array";
import { throttle } from "@render/util/Events";
import ToolTip from "@render/components/Charts/ToolTip.vue";
import ColorScaleLegend from "@render/components/Charts/Colors/ColorScaleLegendSVG.vue";

function default_tooltip_formatter(hoverItem, that) {
  if (hoverItem !== undefined) {
    let hi = hoverItem as Node | Link;
    if (hi.type === "node") {
      return `Node ${hi.id}`;
    } else if (hi.type === "edge") {
      hi = hi as Link;
      return `Link ${hi.id}<br />value = ${hi.value.toExponential(3)}`;
    }
  }
  return "";
}

export default defineComponent({
  components: {
    ColorScaleLegend,
    ToolTip,
  },
  props: {
    // Data for sankey diagram
    data: {
      required: true,
      default: { nodes: [], links: [] } as { nodes: Node[]; links: Link[] },
    },
    // Width of diagram
    width: {
      required: true,
      type: Number,
    },
    // Height of diagram
    height: {
      required: true,
      type: Number,
    },
    // Color of legend title
    colorLegendTitle: {
      type: String,
    },
    // Title of diagram
    title: {
      type: String,
    },
    // Function to format tool tip
    tooltipFormatter: {
      type: Function,
      default: default_tooltip_formatter,
    },
    // Superset of node ID's
    nodeIdSuperset: {
      type: Array,
    },
    // Alignment of nodes
    nodeAlignment: {
      default: NodeAlignment.Justify,
    },
    // Width of nodes
    nodeWidth: {
      type: Number,
      default: 36,
    },
    // Padding around nodes
    nodePadding: {
      type: Number,
      default: 3,
    },
    // Color mode of nodes
    nodeColorMode: {
      default: ColoringMode.Categorical,
    },
    // Color property of nodes
    nodeColorProperty: {
      default: "id",
    },
    // Color mode of links between nodes
    linkColorMode: {
      default: ColoringMode.Categorical,
    },
    // Color property of links between nodes
    linkColorProperty: {
      default: "",
    },
    // Color map based on categories
    categoricalColormap: {
      default: "schemeDark2",
    },
    // Color map based on quantaties
    quantitativeColormap: {
      default: "interpolatePuOr",
    },
    // Message displayed for lack of data
    noDataMessage: {
      default: "No data available.",
      type: String,
    },
  },
  data() {
    return {
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
      tooltipPosition: undefined as { x: number; y: number } | undefined,
      hoverItem: undefined as object | undefined,
      debouncedHover: (event: MouseEvent) => {
        /**/
      },
    };
  },
  watch: {
    linkColorMode: {
      handler(newValue) {
        if (newValue === ColoringMode.Quantitative) {
          this.margin.bottom = 70;
        } else {
          this.margin.bottom = 20;
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.debouncedHover = throttle(this.handleHover, 10);
  },
  computed: {
    graph(): { nodes: Node[]; links: Link[] } {
      if (this.data.nodes.length > 0) {
        return this.sankeyGen(this.data);
      }
      return this.data;
    },
    tooltip_text(): string {
      if (this.hoverItem !== undefined) {
        return (this.tooltipFormatter as (itm, that) => string)(this.hoverItem, this);
      }
      return "";
    },
    showColorLegend(): boolean {
      return this.linkColorMode === ColoringMode.Quantitative;
    },
    innerWidth(): number {
      return this.width - this.margin.left - this.margin.right;
    },
    innerHeight(): number {
      return this.height - this.margin.top - this.margin.bottom;
    },
    sankeyLinkHorizontal() {
      return linkHorizontal()
        .source((link: any) => [link.source.x1, link.y0])
        .target((link: any) => [link.target.x0, link.y1]);
    },
    sankeyGen(): any {
      let align;
      switch (this.nodeAlignment) {
        case NodeAlignment.Left:
          align = sankeyLeft;
          break;
        case NodeAlignment.Right:
          align = sankeyRight;
          break;
        case NodeAlignment.Center:
          align = sankeyCenter;
          break;
        case NodeAlignment.Justify:
        default:
          align = sankeyJustify;
          break;
      }
      return sankey()
        .nodeWidth(this.nodeWidth)
        .nodePadding(this.nodePadding)
        .nodeAlign(align)
        .extent([
          [this.margin.left, this.margin.top],
          [this.margin.left + this.innerWidth, this.margin.top + this.innerHeight],
        ])
        .nodeId((node) => node.name);
    },
    scale(): any {
      let n;
      if (this.nodeColorMode === ColoringMode.Categorical) {
        n = scaleOrdinal<string, string>().range(GetScale(this.categoricalColormap) as string[]);
        if (this.nodeIdSuperset !== undefined) {
          n = n.domain(this.nodeIdSuperset);
        } else {
          n = n.domain(this.data.nodes.map((node) => node[this.nodeColorProperty]));
        }
      }

      let l;
      let li;
      if (this.linkColorMode === ColoringMode.Quantitative) {
        const abstransMax = max(this.data.links, (d) => Math.abs(d[this.linkColorProperty])) || 1;
        li = scaleDiverging(GetScale(this.quantitativeColormap) as (t: number) => string).domain([
          -abstransMax,
          0,
          abstransMax,
        ]);
        l = (link: Link) => color(li(link[this.linkColorProperty]) as string);
      } else {
        li = scaleOrdinal()
          .range(GetScale(this.categoricalColormap) as string[])
          .domain(this.data.links.map((d) => d[this.linkColorProperty]));
        l = (link: Link) => color(li(link[this.linkColorProperty]) as string)!.brighter(0.5);
      }
      return { n, l, li };
    },
  },
  methods: {
    color(value) {
      return color(value);
    },
    onNodeClick(event, node) {
      // Fires when node is clicked
      // @arg An event and clicked node
      this.$emit("node-click", {
        event,
        type: "node",
        value: node,
      });
    },
    onEdgeClick(event, edge) {
      // Fires when edge is clicked
      // @arg An event and clicked edge
      this.$emit("edge-click", {
        event,
        type: "edge",
        value: edge,
      });
    },
    handleHover(event: MouseEvent) {
      if (event && event.target !== null) {
        const target = event.target as HTMLElement;
        if (target.dataset.nodeid) {
          this.tooltipPosition = {
            x: event.clientX,
            y: event.clientY,
          };
          this.hoverItem = this.data.nodes.find((n) => n.id.toString() === target.dataset.nodeid);
          return;
        }

        if (target.dataset.transitionid) {
          this.tooltipPosition = {
            x: event.clientX,
            y: event.clientY,
          };
          this.hoverItem = this.data.links.find((n) => n.id.toString() === target.dataset.transitionid);
          return;
        }
      }
      this.tooltipPosition = undefined;
      this.hoverItem = undefined;
    },
  },
});
</script>

<style scoped>
.sankey-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.link {
  mix-blend-mode: multiply;
}
g.node {
  cursor: pointer;
}
.node-label {
  text-anchor: middle;
  alignment-baseline: middle;
  dominant-baseline: middle;
}
.axis-label {
  text-anchor: middle;
}
.no-data .card {
  width: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
