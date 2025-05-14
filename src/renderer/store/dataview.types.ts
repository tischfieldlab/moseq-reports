export enum CountMethod {
    Usage = "Usage",
    Frames = "Frames",
    Raw = "Raw",
}

export interface SyllableMap {
    usage: number;
    frames: number;
    raw: number;
}

export interface GroupItem {
    name: string;
    color: string;
    selected: boolean;
}

export interface DataviewState {
    name: string;
    color: string;
    loading: boolean;
    selectedSyllable: number;
    countMethod: CountMethod;
    moduleIdFilter: number[];
    views: {};
    groups: GroupItem[];
}

export interface DataviewPayload {
    selectedSyllable?: number;
    countMethod?: CountMethod;
    groups?: GroupItem[]
    moduleIdFilter?: number[];
    view?: any;
}

export interface PublishDatasetPayload {
    owner: string;
    name: string;
    data: any;
}

export interface UnpublishDatasetPayload {
    owner: string;
    name: string;
}
