
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


export type Operation = KeysOperation|PluckOperation|SortOperation|FilterOperation|MapOperation|AggregateOperation;

export interface PluckOperation {
    type: 'pluck';
    column: string|string[];
}
export interface KeysOperation {
    type: 'keys';
}
export interface SortOperation {
    type: 'sort';
    column: string;
    direction: SortDirection|'asc'|'desc';
}
export interface FilterOperation {
    type: 'filter';
    filters: {[key: string]: any[]};
}
export interface MapOperation {
    type: 'map';
    columns?: (string|[string, string])[];
}
export interface AggregateOperation {
    type: 'aggregate';
    groupby: string[];
    aggregate: {[key: string]: Statistic|Statistic[]};
}
type Statistic = ('mean'|'median'|'sum'|'min'|'max');



