import { OrderingType, SortOrderDirection } from "../ClusteredHeatmap.types";

export { default as Colormap } from "./Colormap.vue";
export { default as ColumnOrdering } from "./ColumnOrdering.vue";
export { default as RowOrdering } from "./RowOrdering.vue";

export function get_colormap_options() {
    return {
        colormap: "interpolateViridis",
        vmin: 0,
        auto_vmin: true,
        vmax: 1,
        auto_vmax: true,
    };
}

export function get_column_ordering_options() {
    return {
        column_order_type: OrderingType.HCluster,
        column_order_row_value: undefined,
        column_order_direction: SortOrderDirection.Asc,
        column_cluster_distance: "euclidean",
        column_cluster_linkage: "avg",
        column_cluster_k: 3,
        column_order_dataset: undefined,
    };
}

export function get_row_ordering_options() {
    return {
        row_order_type: OrderingType.HCluster,
        row_order_column_value: undefined,
        row_order_direction: SortOrderDirection.Asc,
        row_cluster_distance: "euclidean",
        row_cluster_linkage: "avg",
        row_cluster_k: 3,
        row_order_dataset: undefined,
    };
}
