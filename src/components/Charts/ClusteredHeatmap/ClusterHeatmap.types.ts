

export enum OrderingType {
    Natural = 'natural',
    Value = 'value',
    Cluster = 'cluster',
    Dataset = 'dataset',
}
export enum SortOrderDirection {
    Asc = 'asc',
    Dec = 'dec',
}
export enum ClusterDistance {
    Euclidean = 'euclidean',
    Angular = 'angular',
}
export enum ClusterLinkage {
    Avg = 'avg',
    Max = 'max',
    Min = 'min',
}

export interface HeatmapTile {
    group: string;
    syllable: number;
    usage: number;
}
