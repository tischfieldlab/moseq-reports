<script lang="ts">
import Vue from 'vue';
import RegisterDataComponent from '@/components/Core';
import { OrderingType, SortOrderDirection, HeatmapTile, ClusterDistance, ClusterLinkage } from './ClusterHeatmap.types';
import * as d3 from 'd3';
import { cluster, hierarchy, extent } from 'd3';
import { scaleBand, scaleSequential } from 'd3-scale';
import { GetScale } from '@/components/Charts/D3ColorProvider';
import { getDendrogramOrder, elbowH, elbowV } from '@/components/Charts/D3Clustering';
import { spawn, Worker, ModuleThread, Thread } from 'threads';
import { ClusterWorker } from './Worker';


if (module.hot) {
    module.hot?.addDisposeHandler(async () => await Thread.terminate(worker));
}
let worker: ModuleThread<ClusterWorker>;
(async () => {
    worker = await spawn<ClusterWorker>(new Worker('./Worker.ts'));
})();

function default_tooltip_formatter(item, that){
    return `Column: ${item[that.columnKey]}<br />
            Row: ${item[that.rowKey]}<br />
            Value: ${item[that.valueKey].toExponential(3)}`;
}


export default Vue.extend({
    props: {
        data: {
            required: true,
            type: Array,
        },
        width: {
            required: true,
            type: Number,
        },
        height: {
            required: true,
            type: Number,
        },
        colorscale: {
            type: String,
            default: 'interpolateViridis',
        },
        columnKey: {
            required: true,
            type: String,
        },
        rowKey: {
            required: true,
            type: String,
        },
        valueKey: {
            required: true,
            type: String,
        },
        columnOrderType: {
            type: String,
            default: OrderingType.Cluster,
        },
        columnClusterDistance: {
            type: String,
            default: ClusterDistance.Euclidean,
        },
        columnClusterLinkage: {
            type: String,
            default: ClusterLinkage.Avg,
        },
        columnOrderValue: {
            type: String,
        },
        columnOrderDirection: {
            type: String,
            default: SortOrderDirection.Asc,
        },
        columnOrderDataset: {
            type: Array,
        },
        rowOrderType: {
            type: String,
            default: OrderingType.Cluster,
        },
        rowClusterDistance: {
            type: String,
            default: ClusterDistance.Euclidean,
        },
        rowClusterLinkage: {
            type: String,
            default: ClusterLinkage.Avg,
        },
        rowOrderValue: {
            type: String,
        },
        rowOrderDirection: {
            type: String,
            default: SortOrderDirection.Asc,
        },
        rowOrderDataset: {
            type: Array,
        },
        groupLabels: {
            required: true,
            type: Array, /* Array<string> */
            default: () => new Array<string>(),
        },
        xAxisTitle: {
            type: String,
            default: 'Group',
        },
        yAxisTitle: {
            type: String,
            default: 'Value',
        },
        legendTitle: {
            type: String,
            default: 'Value',
        },
        selectedRow: {
            type: [String, Number],
            default: null,
        },
        selectedCol: {
            type: String,
            default: null,
        },
        tooltipFormatter: {
            type: Function,
            default: default_tooltip_formatter,
        },
        noDataMessage: {
            type: String,
            default: 'Sorry, no data available!',
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
                this.$emit('row-order-changed', newValue);
            },
            immediate: true,
        },
        columnOrder: {
            handler(newValue) {
                this.$emit('col-order-changed', newValue);
            },
            immediate: true,
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
            label_stats: {count: 0, total: 0, longest: 0},
            watchers: Array<(() => void)>(),
            tooltipPosition: undefined as {x: number, y:number}|undefined,
            hoverItem: undefined as object|undefined,
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
            const rtreeWidth =  this.isRowsClustered ? Math.min(this.innerWidth * .10, 50) : 0;
            const ctreeHeight = this.isColumnsClustered ? Math.min(this.innerHeight * .10, 50) : 0;
            const yaxisWidth = 45;
            let xaxisHeight = 45;
            let xaxisLabelYOffset = 40;
            const legendHeight = 50;

            const heatWidth = this.innerWidth - rtreeWidth - yaxisWidth;

            this.rotate_labels = this.label_stats.longest > heatWidth / this.label_stats.count;
            if (this.rotate_labels) {
                const rotatedHeight = Math.cos(45 * (Math.PI / 180)) * this.label_stats.longest;
                xaxisHeight = xaxisLabelYOffset = rotatedHeight + 20;
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
                x: heatmap.x + (heatmap.w / 2),
                y: this.height - this.margin.bottom - legendHeight + 10,
                w: Math.min(heatmap.w, 400),
                h: legendHeight,
            };
            return {
                heatmap,
                xaxis, yaxis,
                rtree, ctree,
                legend,
            };
        },
        columnOrder(): string[] {
            switch (this.columnOrderType) {
                case OrderingType.Cluster:
                    return this.clusteredColumnOrder;

                case OrderingType.Value:
                    return (this.data as HeatmapTile[])
                               .filter((u) => u[this.rowKey] === this.rowOrderValue)
                               .sort((a, b) => {
                                   if (this.columnOrderDirection === SortOrderDirection.Asc) {
                                       return b[this.valueKey] - a[this.valueKey];
                                   } else {
                                       return a[this.valueKey] - b[this.valueKey];
                                   }
                               })
                               .map((u) => u[this.columnKey]);

                case OrderingType.Dataset:
                    return this.columnOrderDataset as string[] || [];

                case OrderingType.Natural:
                default:
                    return this.groupLabels as string[];
            }
        },
        isColumnsClustered(): boolean {
            return this.columnOrderType === OrderingType.Cluster;
        },
        isRowsClustered(): boolean {
            return this.rowOrderType === OrderingType.Cluster;
        },
        rowOrder(): number[] {
            switch (this.rowOrderType) {
                case OrderingType.Cluster:
                    return this.clusteredRowOrder;

                case OrderingType.Value:
                    return (this.data as HeatmapTile[])
                               .filter((u) => u[this.columnKey] === this.rowOrderValue)
                               .sort((a, b) => {
                                   if (this.rowOrderDirection === SortOrderDirection.Asc) {
                                       return b[this.valueKey] - a[this.valueKey];
                                   } else {
                                       return a[this.valueKey] - b[this.valueKey];
                                   }
                               })
                               .map((u) => u[this.rowKey]);

                case OrderingType.Dataset:
                    return this.rowOrderDataset as number[] || [];

                case OrderingType.Natural:
                default:
                    return [...new Set((this.data as HeatmapTile[]).map((u) => u[this.rowKey]))].sort((a, b) => a - b);
            }
        },
        colormap(): any {
            return GetScale(this.colorscale);
        },
        scale(): any {
            const x = scaleBand()
                .domain(this.columnOrder)
                .range([0, this.dims.heatmap.w])
                .padding(0);
            const y = scaleBand()
                .domain(this.rowOrder.map((s) => s.toString()))
                .range([this.dims.heatmap.h, 0])
                .padding(0);
            let ext = [0, 0];
            if (this.data !== null) {
                ext = extent((this.data as HeatmapTile[]).map((n) => n[this.valueKey])) as [number, number];
            }
            const z = scaleSequential(this.colormap || ((t) => t))
                .domain(ext as [number, number]);
            return { x, y, z };
        },
        columnLinks(): any[] {
            if (this.columnHierarchy === undefined) {
                return [];
            }
            return cluster().size([this.dims.ctree.w, this.dims.ctree.h])(this.columnHierarchy as any).links() as any;
        },
        rowLinks(): any[] {
            if (this.rowHierarchy === undefined) {
                return [];
            }
            return cluster().size([this.dims.rtree.h, this.dims.rtree.w])(this.rowHierarchy as any).links() as any;
        },
        tooltip_text(): string {
            if (this.hoverItem !== undefined){
                return (this.tooltipFormatter as (itm, that) => string)(this.hoverItem, this);
            }
            return '';
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
        elbowH, elbowV,
        async clusterColumns() {
            if (this.data !== null && this.data.length > 0) {
                const tree = await worker.clusterColumns(this.data, this.columnKey, this.valueKey,
                    this.columnClusterDistance as ClusterDistance,
                    this.columnClusterLinkage as ClusterLinkage);
                this.clusteredColumnOrder = getDendrogramOrder(tree);
                this.columnHierarchy = hierarchy(tree);
            }
        },
        async clusterRows() {
            if (this.data !== null && this.data.length > 0) {
                const tree = await worker.clusterRows(this.data, this.rowKey, this.valueKey,
                    this.rowClusterDistance as ClusterDistance,
                    this.rowClusterLinkage as ClusterLinkage);
                this.clusteredRowOrder = getDendrogramOrder(tree);
                this.rowHierarchy = hierarchy(tree);
            }
        },
        handleHeatmapClick(event: Event) {
            this.$emit('heatmapClick', {
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
