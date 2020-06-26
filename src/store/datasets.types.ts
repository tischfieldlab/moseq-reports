

export interface DatasetsState {
    bundle: string; // path to the bundle
    name: string; // basename of the bundle
    path: string; // path to uncompressed data
    manifest: object;
    groups: string[];
    label_map: LabelMapRecord[];
}

export interface LabelMapRecord {
    raw: number;
    usage: number;
    frames: number;
}
