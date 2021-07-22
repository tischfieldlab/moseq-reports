
export interface DataObject {
    columns: string[];
    data: any[];
}
export interface SortSpec {
    column: string;
    direction: SortDirection|'asc'|'desc';
}
export enum SortDirection {
    Asc = 'asc',
    Desc = 'desc',
}


export type Operation = KeysOperation|ValuesOperation|PluckOperation|SortOperation|FilterOperation|MapOperation|AggregateOperation;

export interface PluckOperation {
    type: 'pluck';
    column: string;
}
export interface KeysOperation {
    type: 'keys';
}
export interface ValuesOperation {
    type: 'values';
}
export interface SortOperation {
    type: 'sort';
    columns: string[];
    direction: SortDirection|'asc'|'desc';
}
export interface FilterOperation {
    type: 'filter';
    filters: {[key: string]: any[]};
}
export interface MapOperation {
    type: 'map';
    columns?: ([string, string]|string)[];
}
export interface AggregateOperation {
    type: 'aggregate';
    groupby: string[];
    aggregate: {[key: string]: Statistic|Statistic[]};
}
export type Statistic = ('mean'|'median'|'mode'|'sum'|'cumsum'|'min'|'max'|'extent'|'variance'|'deviation'|'count');



