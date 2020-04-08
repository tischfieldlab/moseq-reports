

export interface DatasetsState {
    bundle: string; // path to the bundle
    name: string; // basename of the bundle
    path: string; // path to uncompressed data
    spinogram: any[];
    usageByUsage: any;
    usageByFrames: any;
    groups: string[];
    label_map: any;
}
