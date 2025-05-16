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

export interface DataViewRecord {
    name: string;
    color: string;
    selectedSyllable: number;
    countMethod: CountMethod;
    moduleIdFilter: number[];
    groups: GroupItem[];
}

export interface DataviewState extends DataViewRecord {
    loading: boolean;
    views: {};
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
