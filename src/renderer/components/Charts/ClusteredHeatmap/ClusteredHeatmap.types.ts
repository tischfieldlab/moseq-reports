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
    Single = "single",
    Complete = "complete",
    Average = "average",
    Weighted = "wpgma",
    Centroid = "centroid",
    Median = "median",
    Ward = "ward",
    Ward2 = "ward2",
}


export interface HClusterOptions {
    distance: HClusterDistance;
    linkage: HClusterLinkage;
}

export interface KClusterOptions {
    k: number;
}