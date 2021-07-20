
export enum CountMethod {
    Usage = 'Usage',
    Frames = 'Frames',
    Raw = 'Raw',
}

export interface DataviewState {
    name: string;
    color: string;
    loading: boolean;
    countMethod: CountMethod;
    selectedGroups: Array<string>;
    groupColors: Array<string>;
    moduleIdFilter: Array<number>;
    selectedSyllable: number;
    views: {};
}

export interface DataviewPayload {
    countMethod?: CountMethod;
    selectedGroups?: Array<string>;
    groupColors?: Array<string>;
    moduleIdFilter?: Array<number>;
    view?: any;
}

export interface SelectedGroupsPayload {
    groups?: Array<string>;
    colors?: Array<string>;
}

export interface PublishedDataset {
    owner: string;
    name: string;
    data: any;
}
