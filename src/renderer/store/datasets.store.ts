import { defineStore, acceptHMRUpdate } from 'pinia'
import path from "path";
import { unnest } from "@render/util/Object";


export interface DatasetsState {
    isLoaded: boolean;
    bundle: string; // path to the bundle
    name: string; // basename of the bundle
    manifest: Record<string, unknown>;
    groups: string[];
    label_map: LabelMapRecord[];
}

export interface LabelMapRecord {
    [key: string]: number; // Added index signature
    raw: number;
    usage: number;
    frames: number;
}


export const useDatasetsStore = defineStore('datasets', {

    state: (): DatasetsState => ({
        isLoaded: false,
        bundle: "",
        name: "",
        manifest: {},
        groups: [],
        label_map: [],
    }),
    getters: {
        resolve: (state) => (filename: string) => {
            const mani = unnest(state.manifest, filename);
            if (mani) {
                filename = mani;
            }
            return filename; //path.join(state.bundle, filename);
        },
        availableUsageModuleIds: (state) => {
            if (!state.label_map) {
                return [];
            }
            return state.label_map
                .filter((row) => row.usage >= 0)
                .map((row) => row.usage)
                .sort((a, b) => a - b);
        },
        availableFramesModuleIds: (state) => {
            if (!state.label_map) {
                return [];
            }
            return state.label_map
                .filter((row) => row.frames >= 0)
                .map((row) => row.frames)
                .sort((a, b) => a - b);
        },
    },
    actions: {
        Unload() {
            this.isLoaded = false;
            this.bundle = "";
            this.name = "";
            this.manifest = {};
            this.groups = [];
            this.label_map = [];
        },
        SetDataSourceInfo(payload: DatasetsState) {
            this.bundle = payload.bundle;
            this.name = payload.name;
            this.manifest = payload.manifest;
        },
        SetGroupInfo(data: DatasetsState) {
            this.groups = [...data.groups];
        },
        SetLabelMap(data: DatasetsState) {
            this.label_map = data.label_map;
        },
        SetLoaded() {
            this.isLoaded = true;
        },
        setData(payload: DatasetsState) {
            this.SetDataSourceInfo(payload);
            this.SetGroupInfo(payload);
            this.SetLabelMap(payload);
            this.SetLoaded();
        },
    },
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useDatasetsStore, import.meta.hot))
}
