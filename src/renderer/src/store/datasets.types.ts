export interface DatasetsState {
    isLoaded: boolean;
    bundle: string; // path to the bundle
    name: string; // basename of the bundle
    manifest: object;
    groups: string[];
    label_map: LabelMapRecord[];
}

export interface LabelMapRecord {
    raw: number;
    usage: number;
    frames: number;
}
