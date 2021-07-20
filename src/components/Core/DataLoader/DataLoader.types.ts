
export interface DataObject {
    columns: Array<string>;
    data: Array<any>;
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
    column: string|Array<string>;
}
export interface KeysOperation {
    type: 'keys';
}
export interface SortOperation {
    type: 'sort';
    columns: Array<string>;
    direction: SortDirection|'asc'|'desc';
}
export interface FilterOperation {
    type: 'filter';
    filters: {[key: string]: Array<any>};
}
export interface MapOperation {
    type: 'map';
    columns?: Array<[string, string]|string>;
}
export interface AggregateOperation {
    type: 'aggregate';
    groupby: Array<string>;
    aggregate: {[key: string]: Statistic|Array<Statistic>};
}
type Statistic = ('mean'|'median'|'sum'|'min'|'max');



