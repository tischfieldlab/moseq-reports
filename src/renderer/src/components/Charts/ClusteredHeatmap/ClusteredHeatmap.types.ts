export enum OrderingType {
    Natural = "natural",
    Value = "value",
    HCluster = "hcluster",
    KCluster = "kcluster",
    Dataset = "dataset",
    Computed = "computed",
}
export enum SortOrderDirection {
    Asc = "asc",
    Dec = "dec",
}
export enum HClusterDistance {
    Euclidean = "euclidean",
    Angular = "angular",
}
export enum HClusterLinkage {
    Avg = "avg",
    Max = "max",
    Min = "min",
}

export type ClusterOptions = HClusterOptions | KClusterOptions;

export interface HClusterOptions {
    type: OrderingType.HCluster;
    distance: HClusterDistance;
    linkage: HClusterLinkage;
}

export interface KClusterOptions {
    type: OrderingType.KCluster;
    k: number;
}
