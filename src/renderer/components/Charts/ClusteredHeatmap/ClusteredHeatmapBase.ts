import { ref, computed, watch, onMounted, onUnmounted, watchSyncEffect, WatchEffect } from 'vue';
import { OrderingType, SortOrderDirection, HClusterDistance, HClusterLinkage } from './ClusteredHeatmap.types';
import { cluster, hierarchy, HierarchyNode } from 'd3-hierarchy';
import { min, max } from 'd3-array';
import { scaleBand, ScaleOrdinal, scaleOrdinal, scaleSequential } from 'd3-scale';
import { GetScale } from '@render/components/Charts/Colors/D3ColorProvider';
import { getDendrogramOrder, elbowH, elbowV, hydrateCluster } from '@render/components/Charts/D3Clustering';
import { DefinedScaleBand } from '../D3Scale';
import { toRaw } from 'vue';





export interface ClusteredHeatmapBaseProps {
    data: object[];
    width: number;
    height: number;
    colorscale: string;
    vmin?: number;
    vmax?: number;
    columnKey: string;
    rowKey: string;
    valueKey: string;
    columnOrderType: string;
    columnClusterDistance: string;
    columnClusterLinkage: string;
    columnClusterK: number;
    columnOrderValue?: string;
    columnOrderDirection: string;
    columnOrderDataset?: string[];
    columnLabelColor?: {[column: string]: string};
    rowOrderType: string;
    rowClusterDistance: string;
    rowClusterLinkage: string;
    rowClusterK: number;
    rowOrderValue?: string;
    rowOrderDirection: string;
    rowOrderDataset?: number[];
    rowLabelColor?: {[column: string]: string};
    groupLabels: string[];
    xAxisTitle?: string;
    yAxisTitle?: string;
    legendTitle?: string;
    selectedRow?: number | null;
    selectedCol?: number | null;
    tooltipFormatter?: (item) => string;
    noDataMessage?: string;
}

export function ClusteredHeatmapBasePropsDefaults() {
    return {
        colorscale: 'interpolateViridis',
        columnOrderType: OrderingType.HCluster,
        columnClusterDistance: HClusterDistance.Euclidean,
        columnClusterLinkage: HClusterLinkage.Single,
        columnClusterK: 2,
        columnOrderValue: undefined,
        columnOrderDirection: SortOrderDirection.Asc,
        rowOrderType: OrderingType.HCluster,
        rowClusterDistance: HClusterDistance.Euclidean,
        rowClusterLinkage: HClusterLinkage.Single,
        rowClusterK: 2,
        rowOrderValue: undefined,
        rowOrderDirection: SortOrderDirection.Asc,
        noDataMessage: 'Sorry, no data available!',
    }
};

export interface ClusteredHeatmapBaseEmits {
    (e: 'row-order-changed', row_order: any[]): void
    (e: 'col-order-changed', col_order: any[]): void
    (e: 'heatmap-click', data: {e: Event, row: string, col: string, value: string}): void
}

export interface ClusteredHeatmapBaseOverrides {
    compute_label_stats: (labels: string[]) => void;
    showSelectedRow: (id: number) => void;
    showSelectedCol: (id: number) => void;
}

export function useClusteredHeatmapBase(props: ClusteredHeatmapBaseProps, emit: ClusteredHeatmapBaseEmits, overrides: ClusteredHeatmapBaseOverrides) {
    const instance = new ComlinkWorker<typeof import("./Worker")>(
        new URL("./Worker", import.meta.url),
        {
          /* normal Worker options*/
        }
    );

    const clusteredColumnOrder = ref<string[]>([]);
    const columnHierarchy = ref<HierarchyNode<any>|undefined>(undefined);
    const clusteredRowOrder = ref<string[]>([]);
    const rowHierarchy = ref<HierarchyNode<any>|undefined>(undefined);
    const rotate_labels = ref<boolean>(false);
    const label_stats = ref({count: 0, total: 0, longest: 0});
    const tooltipPosition = ref<{x: number, y:number}|undefined>(undefined);
    const hoverItem = ref<object|undefined>(undefined);
    const margin = ref({ top: 20, right: 20, bottom: 50, left: 60 });


    const has_data = computed(() => {
        return props.data !== undefined && props.data !== null && props.data.length > 0;
    });

    const innerWidth = computed(() => {
        return props.width - margin.value.left - margin.value.right;
    });
    const innerHeight = computed(() => {
        return props.height - margin.value.top - margin.value.bottom;
    });
    const dims = computed(() => {
        const rtreeWidth =  isRowsHClustered.value ? Math.min(innerWidth.value * .10, 50) : 0;
        const ctreeHeight = isColumnsHClustered.value ? Math.min(innerHeight.value * .10, 50) : 0;
        const yaxisWidth = 45;
        let xaxisHeight = 45;
        let xaxisLabelYOffset = 40;
        const legendHeight = 50;

        const heatWidth = innerWidth.value - rtreeWidth - yaxisWidth;

        rotate_labels.value = label_stats.value.longest > heatWidth / label_stats.value.count;
        if (rotate_labels.value) {
            const rotatedHeight = Math.cos(45 * (Math.PI / 180)) * label_stats.value.longest;
            xaxisHeight = xaxisLabelYOffset = rotatedHeight + 45;
        }

        const heatHeight = innerHeight.value - ctreeHeight - xaxisHeight - legendHeight;

        const heatmap = {
            x: margin.value.left + rtreeWidth,
            y: margin.value.top + ctreeHeight,
            w: heatWidth,
            h: heatHeight,
        };
        const rtree = {
            x: margin.value.left,
            y: margin.value.top + ctreeHeight,
            w: rtreeWidth,
            h: heatHeight,
        };
        const ctree = {
            x: heatmap.x,
            y: margin.value.top,
            w: heatWidth,
            h: ctreeHeight,
        };
        const xaxis = {
            x: heatmap.x,
            y: margin.value.top + ctreeHeight + heatHeight,
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
            y: props.height - margin.value.bottom - legendHeight + 10,
            w: Math.min(heatmap.w, 400),
            h: legendHeight,
        };
        return {
            heatmap,
            xaxis, yaxis,
            rtree, ctree,
            legend,
        };
    });
    const isColumnsClustered = computed(() => {
        return [OrderingType.HCluster, OrderingType.KCluster].includes(props.columnOrderType as OrderingType);
    });
    const isRowsClustered = computed(() => {
        return [OrderingType.HCluster, OrderingType.KCluster].includes(props.rowOrderType as OrderingType);
    });
    const isColumnsHClustered = computed(() => {
        return props.columnOrderType === OrderingType.HCluster;
    });
    const isRowsHClustered = computed(() => {
        return props.rowOrderType === OrderingType.HCluster;
    });
    const isColumnsKClustered = computed(() => {
        return props.columnOrderType === OrderingType.KCluster;
    });
    const isRowsKClustered = computed(() => {
        return props.rowOrderType === OrderingType.KCluster;
    });
    const columnOrder = computed(() => {
        switch (props.columnOrderType) {
            case OrderingType.HCluster:
            case OrderingType.KCluster:
                console.log('clustered column order', clusteredColumnOrder.value);
                return clusteredColumnOrder.value;

            case OrderingType.Value:
                return props.data.filter((u) => u[props.rowKey].toString() === props.columnOrderValue?.toString())
                                .sort((a, b) => {
                                    if (props.columnOrderDirection === SortOrderDirection.Asc) {
                                        return b[props.valueKey] - a[props.valueKey];
                                    } else {
                                        return a[props.valueKey] - b[props.valueKey];
                                    }
                                })
                                .map((u) => u[props.columnKey]);

            case OrderingType.Dataset:
                return props.columnOrderDataset as string[] || [];

            case OrderingType.Natural:
            default:
                return props.groupLabels as string[];
        }
    });
    const rowOrder = computed(() => {
        switch (props.rowOrderType) {
            case OrderingType.HCluster:
            case OrderingType.KCluster:
                return clusteredRowOrder.value;

            case OrderingType.Value:
                return props.data.filter((u) => u[props.columnKey].toString() === props.rowOrderValue?.toString())
                                .sort((a, b) => {
                                    if (props.rowOrderDirection === SortOrderDirection.Asc) {
                                        return b[props.valueKey] - a[props.valueKey];
                                    } else {
                                        return a[props.valueKey] - b[props.valueKey];
                                    }
                                })
                                .map((u) => u[props.rowKey]);

            case OrderingType.Dataset:
                return props.rowOrderDataset as number[] || [];

            case OrderingType.Natural:
            default:
                return [...new Set(props.data.map((u) => u[props.rowKey]))].sort((a, b) => a - b);
        }
    });
    const scale = computed(() => {
        const x = scaleBand<string>()
            .domain(columnOrder.value.map((s) => s.toString() || ''))
            .range([0, dims.value.heatmap.w])
            .padding(0) as DefinedScaleBand<string>;
        const y = scaleBand<string>()
            .domain(rowOrder.value.map((s) => s.toString() || ''))
            .range([dims.value.heatmap.h, 0])
            .padding(0) as DefinedScaleBand<string>;
        const vals = (props.data || []).map((n) => n[props.valueKey] as number);
        const ext = [
            props.vmin || min(vals) || 0,
            props.vmax || max(vals) || 0,
        ];
        const z = scaleSequential(GetScale(props.colorscale))
            .domain(ext);
        const clc = scaleOrdinal<string>()
            .unknown('#000000')
            .domain(Object.keys(props.columnLabelColor || {}))
            .range(Object.values(props.columnLabelColor || {}));
        const rlc = scaleOrdinal<string>()
            .unknown('#000000')
            .domain(Object.keys(props.rowLabelColor || {}))
            .range(Object.values(props.rowLabelColor || {}));
        return { x, y, z, clc, rlc };
    });
    const columnLinks = computed(() => {
        if (columnHierarchy.value === undefined) {
            return [];
        }
        return cluster().size([dims.value.ctree.w, dims.value.ctree.h])(columnHierarchy.value).links();
    });
    const rowLinks = computed(() => {
        if (rowHierarchy.value === undefined) {
            return [];
        }
        return cluster().size([dims.value.rtree.h, dims.value.rtree.w])(rowHierarchy.value).links();
    });
    const tooltip_text = computed(() => {
        if (hoverItem.value !== undefined){
            if (props.tooltipFormatter === undefined) {
                return default_tooltip_formatter(hoverItem.value);
            }
            return props.tooltipFormatter(hoverItem.value);
        }
        return '';
    });



    function prep_data() {
        if (props.data !== null) {
            //clusterColumns();
            //clusterRows();
            overrides.compute_label_stats(props.groupLabels as string[]);
        }
    }
    
    async function clusterColumns() {
        console.log('about to cluster columns');
        if (props.data !== null && props.data.length > 0) {
            if (props.columnOrderType === OrderingType.HCluster) {
                instance.hCluster(toRaw(props.data), props.columnKey, props.valueKey, {
                    distance: props.columnClusterDistance as HClusterDistance,
                    linkage: props.columnClusterLinkage as HClusterLinkage
                }).then((result) => {
                    const cluster = hydrateCluster(result.cluster);
                    clusteredColumnOrder.value = cluster.indices().map((i) => result.keys[i]);
                    columnHierarchy.value = hierarchy(cluster);
                });
            } else if (props.columnOrderType === OrderingType.KCluster) {
                instance.kCluster(toRaw(props.data), props.columnKey, props.valueKey, {
                    k: props.columnClusterK
                }).then((result) => {
                    const cco = result.clusters.reduce<string[][]>((acc: string[][], c, idx) => {
                        if (acc[c] === undefined) {
                            acc[c] = [];
                        }
                        acc[c].push(result.keys[idx]);
                        return acc;
                    }, []).reduce((acc: any[], c, idx) => {
                        return acc.concat(c, [-1*(idx+1)]);
                    }, []);
                    cco.pop(); // remove the last -1
                    clusteredColumnOrder.value = cco;
                });
            }
        }
    }
    async function clusterRows() {
        console.log('about to cluster rows');
        if (props.data !== null && props.data.length > 0) {
            if (props.rowOrderType === OrderingType.HCluster) {
                instance.hCluster(toRaw(props.data), props.rowKey, props.valueKey, {
                    distance: props.rowClusterDistance as HClusterDistance,
                    linkage: props.rowClusterLinkage as HClusterLinkage
                }).then((result) => {
                    const cluster = hydrateCluster(result.cluster);
                    clusteredRowOrder.value = cluster.indices().map((i) => result.keys[i]);
                    rowHierarchy.value = hierarchy(cluster);
                });
            } else if (props.rowOrderType === OrderingType.KCluster) {
                instance.kCluster(toRaw(props.data), props.rowKey, props.valueKey, {
                    k: props.rowClusterK
                }).then((result) => {
                    const cro = result.clusters.reduce<string[][]>((acc: string[][], c, idx) => {
                        if (acc[c] === undefined) {
                            acc[c] = [];
                        }
                        acc[c].push(result.keys[idx]);
                        return acc;
                    }, []).reduce((acc: any[], c, idx) => {
                        return acc.concat(c, [-1*(idx+1)]);
                    }, []);
                    cro.pop(); // remove the last -1
                    clusteredRowOrder.value = cro;
                });
            }
        }
    }
    function shouldHideLabel(label) {
        return Number.parseInt(label, 10) < 0;
    }
    function default_tooltip_formatter(item){
        return `Column: ${item[props.columnKey]}<br />
                Row: ${item[props.rowKey]}<br />
                Value: ${item[props.valueKey].toExponential(3)}`;
    }

    const watchers: (() => void)[] = [];
    //watchers.push(watchSyncEffect(prep_data));
    watchers.push(watchSyncEffect(async () => await clusterColumns()));
    watchers.push(watchSyncEffect(async () => await clusterRows()));
    watchers.push(watch(() => props.selectedRow, (newValue) => { if (newValue) overrides.showSelectedRow(newValue)}, {immediate: true }));
    watchers.push(watch(() => props.selectedCol, (newValue) => {if (newValue) overrides.showSelectedCol(newValue)}, {immediate: true }));
    watchers.push(watch(() => rowOrder, (newValue) => emit('row-order-changed', newValue.value), {immediate: true }));
    watchers.push(watch(() => columnOrder, (newValue) =>  emit('col-order-changed', newValue.value), {immediate: true }));
    
    //watchers.push(watch(() => props.columnClusterK, (newValue) =>  clusterColumns(), {immediate: true }));
    //watchers.push(watch(() => props.rowClusterK, () => clusterRows(), {immediate: true }));

    onMounted(() => {
        prep_data();
    });
    onUnmounted(() => {
        // un-watch the store
        watchers.forEach((w) => w());
        //cleanup(); // cleanup the worker
    });

    return {
        clusteredColumnOrder,
        clusteredRowOrder,
        columnHierarchy,
        rowHierarchy,
        rotate_labels,
        label_stats,
        tooltipPosition,
        hoverItem,
        margin,
        has_data,
        innerWidth,
        innerHeight,
        dims,
        isColumnsClustered,
        isRowsClustered,
        isColumnsHClustered,
        isRowsHClustered,
        isColumnsKClustered,
        isRowsKClustered,
        columnOrder,
        rowOrder,
        scale,
        columnLinks,
        rowLinks,
        tooltip_text,
        elbowH,
        elbowV,
        shouldHideLabel,
        default_tooltip_formatter
    }
}
