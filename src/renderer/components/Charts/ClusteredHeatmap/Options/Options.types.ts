import { HClusterDistance, HClusterLinkage, OrderingType, SortOrderDirection } from "../ClusteredHeatmap.types";

export interface CommonProps {
    id: string;
}

export interface CommonOrderingProps extends CommonProps {
    order_type_options?: OrderingTypeOption[];
    order_direction_options?: SortOrderDirectionOption[];
    cluster_distance_options?: ClusterDistanceOption[];
    cluster_linkage_options?: ClusterLinkageOption[];
}

export interface ColumnOrderingProps extends CommonOrderingProps {
    row_options: GenericOption[];
}
export interface RowOrderingProps extends CommonOrderingProps {
    column_options: GenericOption[];
}

interface GenericOption {
    text: string;
    value: string;
}
interface OrderingTypeOption {
    text: string;
    value: OrderingType;
}
interface SortOrderDirectionOption {
    text: string;
    value: SortOrderDirection;
}
interface ClusterDistanceOption {
    text: string;
    value: HClusterDistance;
}
interface ClusterLinkageOption {
    text: string;
    value: HClusterLinkage;
}
export const CommonOrderingPropsDefaults = {
    order_type_options: () => [
        { text: 'ID', value: OrderingType.Natural },
        { text: 'Value', value: OrderingType.Value },
        { text: 'Hierarchical Cluster', value: OrderingType.HCluster },
        { text: 'K-means Cluster', value: OrderingType.KCluster },
        { text: 'Dataset', value: OrderingType.Dataset },
    ] as OrderingTypeOption[],
    order_direction_options: () => [
        { text: 'Ascending', value: SortOrderDirection.Asc },
        { text: 'Descending', value: SortOrderDirection.Dec },
    ] as SortOrderDirectionOption[],
    cluster_distance_options: () => [
        { text: 'Euclidean', value: HClusterDistance.Euclidean },
        // { text: 'Manhattan', value: 'manhattan' },
        // { text: 'Chebyshev', value: 'chebyshev' },
        // { text: 'Cosine', value: 'cosine' },
        { text: 'Angular', value: HClusterDistance.Angular },
    ] as ClusterDistanceOption[],
    cluster_linkage_options: () => [
        { text: 'Single', value: HClusterLinkage.Single },
        { text: 'Complete', value: HClusterLinkage.Complete },
        { text: 'Average', value: HClusterLinkage.Average },
        { text: 'Weighted', value: HClusterLinkage.Weighted },
        { text: 'Centroid', value: HClusterLinkage.Centroid },
        { text: 'Median', value: HClusterLinkage.Median },
        { text: 'Ward', value: HClusterLinkage.Ward },
        { text: 'Ward2', value: HClusterLinkage.Ward2 },
    ] as ClusterLinkageOption[],
};

export interface ColormapSettings {
    colormap: string;
    vmin: number;
    auto_vmin: boolean;
    vmax: number;
    auto_vmax: boolean;
}

export function ColormapSettingsDefaults(): ColormapSettings {
    return {
        colormap: "interpolateViridis",
        vmin: 0,
        auto_vmin: true,
        vmax: 1,
        auto_vmax: true,
    };
};

export interface ColumnOrderingSettings {
    column_order_type: OrderingType;
    column_order_row_value: string;
    column_order_direction: SortOrderDirection;
    column_cluster_distance: string;
    column_cluster_linkage: string;
    column_cluster_k: number;
    column_order_dataset: string;
}
export function ColumnOrderingSettingsDefaults(): ColumnOrderingSettings {
    return {
        column_order_type: OrderingType.Natural,
        column_order_row_value: "",
        column_order_direction: SortOrderDirection.Asc,
        column_cluster_distance: HClusterDistance.Euclidean,
        column_cluster_linkage: HClusterLinkage.Single,
        column_cluster_k: 1,
        column_order_dataset: "",
    };
};
export interface RowOrderingSettings {
    row_order_type: OrderingType;
    row_order_column_value: string;
    row_order_direction: SortOrderDirection;
    row_cluster_distance: string;
    row_cluster_linkage: string;
    row_cluster_k: number;
    row_order_dataset: string;
}
export function RowOrderingSettingsDefaults(): RowOrderingSettings {
    return {
        row_order_type: OrderingType.Natural,
        row_order_column_value: "",
        row_order_direction: SortOrderDirection.Asc,
        row_cluster_distance: HClusterDistance.Euclidean,
        row_cluster_linkage: HClusterLinkage.Single,
        row_cluster_k: 1,
        row_order_dataset: "",
    };
};