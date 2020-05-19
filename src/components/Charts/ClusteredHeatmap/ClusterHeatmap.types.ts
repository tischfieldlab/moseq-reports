

export enum OrderingType {
    Natural = 'natural',
    Value = 'value',
    Cluster = 'cluster',
}
export enum SortOrderDirection {
    Asc = 'asc',
    Dec = 'dec',
}

export interface HeatmapTile {
    group: string;
    syllable: number;
    usage: number;
}
