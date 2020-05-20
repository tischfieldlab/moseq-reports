
export interface DataObject {
    columns: string[];
    data: any[];
}
export interface SortSpec {
    column: string;
    direction: SortDirection;
}
export enum SortDirection {
    Asc = 'asc',
    Desc = 'desc',
}
