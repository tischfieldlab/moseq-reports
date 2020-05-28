import { SortSpec } from '@/components/Core/DataLoader/DataLoader.types';

export enum CountMethod {
    Usage = 'Usage',
    Frames = 'Frames',
    Raw = 'Raw',
}

export interface DataviewState {
    loading: boolean;
    countMethod: CountMethod;
    selectedGroups: string[];
    groupColors: string[];
    moduleIdFilter: number[];
    selectedSyllable: number;
    views: {};
}

export interface DataviewPayload {
    countMethod?: CountMethod;
    selectedGroups?: string[];
    groupColors?: string[];
    moduleIdFilter?: number[];
    view?: any;
}

export interface SelectedGroupsPayload {
    groups?: string[];
    colors?: string[];
}

export interface DataViewSpec {
    dataset: string;
    dependOn: string[];
    columns: (string|[string, string])[];
    sorting?: SortSpec|undefined;
    filter?: {[key: string]: any[]}|undefined;
}
export interface PublishedDataset {
    owner: string;
    name: string;
    data: any;
}
