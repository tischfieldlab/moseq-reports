

export interface DatasetsState {
    bundle: string; // path to the bundle
    name: string; // basename of the bundle
    manifest: object;
    groups: Array<string>;
    label_map: Array<LabelMapRecord>;
}

export interface LabelMapRecord {
    raw: number;
    usage: number;
    frames: number;
}
