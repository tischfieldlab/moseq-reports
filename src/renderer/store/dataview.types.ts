export enum CountMethod {
  Usage = "Usage",
  Frames = "Frames",
  Raw = "Raw",
}

export interface DataviewState {
  name: string;
  color: string;
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

export interface PublishDatasetPayload {
  owner: string;
  name: string;
  data: any;
}

export interface UnpublishDatasetPayload {
  owner: string;
  name: string;
}
