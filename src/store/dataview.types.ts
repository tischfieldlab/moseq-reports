export enum CountMethod {
    Usage = 'Usage',
    Frames = 'Frames',
}

export interface DataviewState {
    loading: boolean;
    countMethod: CountMethod;
    selectedGroups: string[];
    groupColors: string[];
    moduleIdFilter: number[];
    selectedSyllable: number;
    view: any;
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
