export interface DatasetsState {
  isLoaded: boolean;
  bundle: string; // path to the bundle
  name: string; // basename of the bundle
  manifest: object;
  groups: string[];
  label_map: LabelMapRecord[];
}

export interface LabelMapRecord {
  [key: string]: number; // Added index signature
  raw: number;
  usage: number;
  frames: number;
}
