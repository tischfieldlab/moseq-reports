<script lang="ts">
import Vue, { PropType } from "vue";
import { OrderingType, SortOrderDirection, HClusterDistance, HClusterLinkage } from "./ClusteredHeatmap.types";
import { cluster, hierarchy, min, max } from "d3";
import { scaleBand, scaleOrdinal, scaleSequential } from "d3-scale";
import { GetScale } from "@render/components/Charts/Colors/D3ColorProvider";
import { getDendrogramOrder, elbowH, elbowV } from "@render/components/Charts/D3Clustering";
// import { spawn, Worker, ModuleThread, Thread } from "threads";
// import { ClusterWorker } from "./Worker";

if (import.meta.hot) {
  // Do whatever we need to do for threads...
}

// if (module.hot) {
//   module.hot?.addDisposeHandler(async () => await Thread.terminate(worker));
// }
// let worker: ModuleThread<ClusterWorker>;
// (async () => {
//   worker = await spawn<ClusterWorker>(new Worker("./Worker.ts"));
// })();

function default_tooltip_formatter(item, that) {
  return `Column: ${item[that.columnKey]}<br />
            Row: ${item[that.rowKey]}<br />
            Value: ${item[that.valueKey].toExponential(3)}`;
}

export default Vue.extend({
  props: {
    // Data used in heatmap
    data: {
      required: true,
      type: Array as PropType<object[]>,
    },
    // Width of heatmap
    width: {
      required: true,
      type: Number,
    },
    height: {
      // Height of heatmap
      required: true,
      type: Number,
    },
    // Colorscale of heatmap
    colorscale: {
      type: String,
      default: "interpolateViridis",
    },
    // Minimum value of heatmap
    vmin: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    // Maximum value of heatmap
    vmax: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    // Column key of heatmap
    columnKey: {
      required: true,
      type: String,
    },
    // Row key of heatmap
    rowKey: {
      required: true,
      type: String,
    },
    // Value key of heatmap
    valueKey: {
      required: true,
      type: String,
    },
    // Ordering of column values of heatmap
    columnOrderType: {
      type: String,
      default: OrderingType.HCluster,
    },
    // Distance between column clusters
    columnClusterDistance: {
      type: String,
      default: HClusterDistance.Euclidean,
    },
    // Links between column clusters
    columnClusterLinkage: {
      type: String,
      default: HClusterLinkage.Avg,
    },
    // Number of column clusters
    columnClusterK: {
      type: Number,
      default: 2,
    },
    // Order of column values of heatmap
    columnOrderValue: {
      type: String,
    },
    // Ascending or descending column order
    columnOrderDirection: {
      type: String,
      default: SortOrderDirection.Asc,
    },
    // Dataset orderd by columnOrder
    columnOrderDataset: {
      type: Array,
    },
    // Color of column label
    columnLabelColor: {
      type: Object as PropType<{ [column: string]: string } | undefined>,
      default: undefined,
    },
    // Ordering of row values of heatmap
    rowOrderType: {
      type: String,
      default: OrderingType.HCluster,
    },
    // Distance between row clusters
    rowClusterDistance: {
      type: String,
      default: HClusterDistance.Euclidean,
    },
    // Links between row clusters
    rowClusterLinkage: {
      type: String,
      default: HClusterLinkage.Avg,
    },
    // Number of row clusters
    rowClusterK: {
      type: Number,
      default: 2,
    },
    // Order of row values
    rowOrderValue: {
      type: String,
    },
    // Ascending or descending row order
    rowOrderDirection: {
      type: String,
      default: SortOrderDirection.Asc,
    },
    // Dataset orderd by rowOrder
    rowOrderDataset: {
      type: Array,
    },
    // Color of row label
    rowLabelColor: {
      type: Object as PropType<{ [column: string]: string } | undefined>,
      default: undefined,
    },
    // List of groups
    groupLabels: {
      required: true,
      type: Array as PropType<string[]>,
      default: () => new Array<string>(),
    },
    // Title of xAxis
    xAxisTitle: {
      type: String,
      default: "Group",
    },
    // Title of yAxis
    yAxisTitle: {
      type: String,
      default: "Value",
    },
    // Title of legend
    legendTitle: {
      type: String,
      default: "Value",
    },
    // Selected row
    selectedRow: {
      type: [String, Number],
      default: null,
    },
    // Selected column
    selectedCol: {
      type: [String, Number],
      default: null,
    },
    // Function to format tooltips
    tooltipFormatter: {
      type: Function,
      default: default_tooltip_formatter,
    },
    // Message displayed for lack of data
    noDataMessage: {
      type: String,
      default: "Sorry, no data available!",
    },
  },
  watch: {
    data: {
      async handler(newData) {
        this.prep_data();
      },
      immediate: true,
    },
    selectedRow: {
      handler(newValue) {
        this.showSelectedRow(newValue);
      },
      immediate: true,
    },
    selectedCol: {
      handler(newValue) {
        this.showSelectedCol(newValue);
      },
      immediate: true,
    },
    rowOrder: {
      handler(newValue) {
        // Fired when row order is changed
        // @arg The new row order
        this.$emit("row-order-changed", newValue);
      },
      immediate: true,
    },
    columnOrder: {
      handler(newValue) {
        // Fired when column order is changed
        // @arg The new column order
        this.$emit("col-order-changed", newValue);
      },
      immediate: true,
    },
    columnOrderType: {
      handler(newValue) {
        this.clusterColumns();
      },
    },
    rowOrderType: {
      handler(newValue) {
        this.clusterRows();
      },
    },
    columnClusterK: {
      handler(newValue) {
        this.clusterColumns();
      },
    },
    rowClusterK: {
      handler() {
        this.clusterRows();
      },
    },
  },
  data() {
    return {
      clusteredColumnOrder: new Array<string>(),
      columnHierarchy: undefined as any,
      clusteredRowOrder: new Array<number>(),
      rowHierarchy: undefined as any,
      rotate_labels: false,
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
      label_stats: { count: 0, total: 0, longest: 0 },
      watchers: Array<() => void>(),
      tooltipPosition: undefined as { x: number; y: number } | undefined,
      hoverItem: undefined as object | undefined,
    };
  },
  mounted() {
    this.prep_data();
  },
  destroyed() {
    // un-watch the store
    this.watchers.forEach((w) => w());
  },
  computed: {
    has_data(): boolean {
      return this.data !== undefined && this.data !== null && this.data.length > 0;
    },
    innerWidth(): number {
      return this.width - this.margin.left - this.margin.right;
    },
    innerHeight(): number {
      return this.height - this.margin.top - this.margin.bottom;
    },
    dims(): any {
      const rtreeWidth = this.isRowsHClustered ? Math.min(this.innerWidth * 0.1, 50) : 0;
      const ctreeHeight = this.isColumnsHClustered ? Math.min(this.innerHeight * 0.1, 50) : 0;
      const yaxisWidth = 45;
      let xaxisHeight = 45;
      let xaxisLabelYOffset = 40;
      const legendHeight = 50;

      const heatWidth = this.innerWidth - rtreeWidth - yaxisWidth;

      this.rotate_labels = this.label_stats.longest > heatWidth / this.label_stats.count;
      if (this.rotate_labels) {
        const rotatedHeight = Math.cos(45 * (Math.PI / 180)) * this.label_stats.longest;
        xaxisHeight = xaxisLabelYOffset = rotatedHeight + 45;
      }

      const heatHeight = this.innerHeight - ctreeHeight - xaxisHeight - legendHeight;

      const heatmap = {
        x: this.margin.left + rtreeWidth,
        y: this.margin.top + ctreeHeight,
        w: heatWidth,
        h: heatHeight,
      };
      const rtree = {
        x: this.margin.left,
        y: this.margin.top + ctreeHeight,
        w: rtreeWidth,
        h: heatHeight,
      };
      const ctree = {
        x: heatmap.x,
        y: this.margin.top,
        w: heatWidth,
        h: ctreeHeight,
      };
      const xaxis = {
        x: heatmap.x,
        y: this.margin.top + ctreeHeight + heatHeight,
        w: heatWidth,
        h: xaxisHeight,
        ly: xaxisLabelYOffset,
      };
      const yaxis = {
        x: heatmap.x + heatWidth,
        y: heatmap.y,
        w: yaxisWidth,
        h: heatHeight,
      };
      const legend = {
        x: heatmap.x + heatmap.w / 2,
        y: this.height - this.margin.bottom - legendHeight + 10,
        w: Math.min(heatmap.w, 400),
        h: legendHeight,
      };
      return {
        heatmap,
        xaxis,
        yaxis,
        rtree,
        ctree,
        legend,
      };
    },
    isColumnsClustered(): boolean {
      return [OrderingType.HCluster, OrderingType.KCluster].includes(this.columnOrderType as OrderingType);
    },
    isRowsClustered(): boolean {
      return [OrderingType.HCluster, OrderingType.KCluster].includes(this.rowOrderType as OrderingType);
    },
    isColumnsHClustered(): boolean {
      return this.columnOrderType === OrderingType.HCluster;
    },
    isRowsHClustered(): boolean {
      return this.rowOrderType === OrderingType.HCluster;
    },
    isColumnsKClustered(): boolean {
      return this.columnOrderType === OrderingType.KCluster;
    },
    isRowsKClustered(): boolean {
      return this.rowOrderType === OrderingType.KCluster;
    },
    columnOrder(): string[] {
      switch (this.columnOrderType) {
        case OrderingType.HCluster:
        case OrderingType.KCluster:
          return this.clusteredColumnOrder;

        case OrderingType.Value:
          return this.data
            .filter((u) => u[this.rowKey].toString() === this.columnOrderValue.toString())
            .sort((a, b) => {
              if (this.columnOrderDirection === SortOrderDirection.Asc) {
                return b[this.valueKey] - a[this.valueKey];
              } else {
                return a[this.valueKey] - b[this.valueKey];
              }
            })
            .map((u) => u[this.columnKey]);

        case OrderingType.Dataset:
          return (this.columnOrderDataset as string[]) || [];

        case OrderingType.Natural:
        default:
          return this.groupLabels as string[];
      }
    },
    rowOrder(): number[] {
      switch (this.rowOrderType) {
        case OrderingType.HCluster:
        case OrderingType.KCluster:
          return this.clusteredRowOrder;

        case OrderingType.Value:
          return this.data
            .filter((u) => u[this.columnKey].toString() === this.rowOrderValue.toString())
            .sort((a, b) => {
              if (this.rowOrderDirection === SortOrderDirection.Asc) {
                return b[this.valueKey] - a[this.valueKey];
              } else {
                return a[this.valueKey] - b[this.valueKey];
              }
            })
            .map((u) => u[this.rowKey]);

        case OrderingType.Dataset:
          return (this.rowOrderDataset as number[]) || [];

        case OrderingType.Natural:
        default:
          return [...new Set(this.data.map((u) => u[this.rowKey]))].sort((a, b) => a - b);
      }
    },
    colormap(): any {
      return GetScale(this.colorscale);
    },
    scale(): any {
      const x = scaleBand()
        .domain(this.columnOrder.map((s) => s.toString() || ""))
        .range([0, this.dims.heatmap.w])
        .padding(0);
      const y = scaleBand()
        .domain(this.rowOrder.map((s) => s.toString() || ""))
        .range([this.dims.heatmap.h, 0])
        .padding(0);
      const vals = (this.data || []).map((n) => n[this.valueKey] as number);
      const ext = [this.vmin || min(vals) || 0, this.vmax || max(vals) || 0];
      const z = scaleSequential(this.colormap || ((t) => t)).domain(ext);
      const clc = scaleOrdinal()
        .unknown("#000000")
        .domain(Object.keys(this.columnLabelColor || {}))
        .range(Object.values(this.columnLabelColor || {}));
      const rlc = scaleOrdinal()
        .unknown("#000000")
        .domain(Object.keys(this.rowLabelColor || {}))
        .range(Object.values(this.rowLabelColor || {}));
      return { x, y, z, clc, rlc };
    },
    columnLinks(): any[] {
      if (this.columnHierarchy === undefined) {
        return [];
      }
      return cluster()
        .size([this.dims.ctree.w, this.dims.ctree.h])(this.columnHierarchy as any)
        .links() as any;
    },
    rowLinks(): any[] {
      if (this.rowHierarchy === undefined) {
        return [];
      }
      return cluster()
        .size([this.dims.rtree.h, this.dims.rtree.w])(this.rowHierarchy as any)
        .links() as any;
    },
    tooltip_text(): string {
      if (this.hoverItem !== undefined) {
        return (this.tooltipFormatter as (itm, that) => string)(this.hoverItem, this);
      }
      return "";
    },
  },
  methods: {
    prep_data() {
      if (this.data !== null) {
        this.clusterColumns();
        this.clusterRows();
        this.compute_label_stats(this.groupLabels as string[]);
      }
    },
    elbowH,
    elbowV,
    async clusterColumns() {
      if (this.data !== null && this.data.length > 0) {
        if (this.columnOrderType === OrderingType.HCluster) {
          //   const tree = await worker.clusterColumns(this.data, this.columnKey, this.valueKey, {
          //     type: OrderingType.HCluster,
          //     distance: this.columnClusterDistance as HClusterDistance,
          //     linkage: this.columnClusterLinkage as HClusterLinkage,
          //   });
          //   this.clusteredColumnOrder = getDendrogramOrder(tree);
          //   this.columnHierarchy = hierarchy(tree);
        } else if (this.columnOrderType === OrderingType.KCluster) {
          //   const data = await worker.clusterColumns(this.data, this.columnKey, this.valueKey, {
          //     type: OrderingType.KCluster,
          //     k: this.columnClusterK,
          //   });
          //   const cco = data
          //     .reduce((acc, c, idx) => acc.concat(c.clusterInd, [-1 * (idx + 1)]), [])
          //     .map((idx: number) => this.groupLabels[idx] || idx.toString());
          //   cco.pop();
          //   this.clusteredColumnOrder = cco;
        }
      }
    },
    async clusterRows() {
      if (this.data !== null && this.data.length > 0) {
        if (this.rowOrderType === OrderingType.HCluster) {
          //   const tree = await worker.clusterRows(this.data, this.rowKey, this.valueKey, {
          //     type: OrderingType.HCluster,
          //     distance: this.rowClusterDistance as HClusterDistance,
          //     linkage: this.rowClusterLinkage as HClusterLinkage,
          //   });
          //   this.clusteredRowOrder = getDendrogramOrder(tree);
          //   this.rowHierarchy = hierarchy(tree);
        } else if (this.rowOrderType === OrderingType.KCluster) {
          //   const data = await worker.clusterColumns(this.data, this.rowKey, this.valueKey, {
          //     type: OrderingType.KCluster,
          //     k: this.rowClusterK,
          //   });
          //   const cro = data.reduce((acc: number[], c, idx) => acc.concat(c.clusterInd, [-1 * (idx + 1)]), []);
          //   cro.pop();
          //   this.clusteredRowOrder = cro;
        }
      }
    },
    shouldHideLabel(label) {
      return Number.parseInt(label, 10) < 0;
    },
    handleHeatmapClick(event: Event) {
      // Fired when heatmap is clicked
      // @arg An event, the row, col, and value of the heatmap
      this.$emit("heatmapClick", {
        e: event,
        row: (event.target as SVGRectElement).dataset.row,
        col: (event.target as SVGRectElement).dataset.col,
        value: (event.target as SVGRectElement).dataset.val,
      });
    },
    compute_label_stats(labels: string[]) {
      // abstract
    },
    showSelectedRow(id: number) {
      // abstract
    },
    showSelectedCol(id: number) {
      // abstract
    },
  },
});
</script>
