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
        { text: 'Additive Symmetric', value: HClusterDistance.AdditiveSymmetric },
        { text: 'Avg', value: HClusterDistance.Avg },
        { text: 'Bhattacharyya', value: HClusterDistance.Bhattacharyya },
        { text: 'Canberra', value: HClusterDistance.Canberra },
        { text: 'Chebyshev', value: HClusterDistance.Chebyshev },
        { text: 'Clark', value: HClusterDistance.Clark },
        { text: 'Czekanowski', value: HClusterDistance.Czekanowski },
        { text: 'Dice', value: HClusterDistance.Dice },
        { text: 'Divergence', value: HClusterDistance.Divergence },
        { text: 'Euclidean', value: HClusterDistance.Euclidean },
        { text: 'Fidelity', value: HClusterDistance.Fidelity },
        { text: 'Gower', value: HClusterDistance.Gower },
        { text: 'Harmonic Mean', value: HClusterDistance.HarmonicMean },
        { text: 'Hellinger', value: HClusterDistance.Hellinger },
        { text: 'Inner Product', value: HClusterDistance.InnerProduct },
        { text: 'Intersection', value: HClusterDistance.Intersection },
        { text: 'Jaccard', value: HClusterDistance.Jaccard },
        { text: 'Jeffreys', value: HClusterDistance.Jeffreys },
        { text: 'Jensen Difference', value: HClusterDistance.JensenDifference },
        { text: 'Jensen Shannon', value: HClusterDistance.JensenShannon },
        { text: 'Kdivergence', value: HClusterDistance.Kdivergence },
        { text: 'Kulczynski', value: HClusterDistance.Kulczynski },
        { text: 'Kullback Leibler', value: HClusterDistance.KullbackLeibler },
        { text: 'Kumar Johnson', value: HClusterDistance.KumarJohnson },
        { text: 'Lorentzian', value: HClusterDistance.Lorentzian },
        { text: 'Manhattan', value: HClusterDistance.Manhattan },
        { text: 'Matusita', value: HClusterDistance.Matusita },
        { text: 'Motyka', value: HClusterDistance.Motyka },
        { text: 'Neyman', value: HClusterDistance.Neyman },
        { text: 'Pearson', value: HClusterDistance.Pearson },
        { text: 'Probabilistic Symmetric', value: HClusterDistance.ProbabilisticSymmetric },
        { text: 'Ruzicka', value: HClusterDistance.Ruzicka },
        { text: 'Soergel', value: HClusterDistance.Soergel },
        { text: 'Sorensen', value: HClusterDistance.Sorensen },
        { text: 'Squared', value: HClusterDistance.Squared },
        { text: 'Squared Chord', value: HClusterDistance.SquaredChord },
        { text: 'Squared Euclidean', value: HClusterDistance.SquaredEuclidean },
        { text: 'Taneja', value: HClusterDistance.Taneja },
        { text: 'Tanimoto', value: HClusterDistance.Tanimoto },
        { text: 'Topsoe', value: HClusterDistance.Topsoe },
        { text: 'Wave Hedges', value: HClusterDistance.WaveHedges },
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