import { schemeDark2, schemePastel1 } from "d3-scale-chromatic";
import { scaleOrdinal } from "d3-scale";
import {
    DataviewState,
    CountMethod,
    DataviewPayload,
    PublishDatasetPayload,
    UnpublishDatasetPayload,
    SyllableMap,
    DataViewRecord,
} from "@store/dataview.types";

import { defineStore, acceptHMRUpdate } from 'pinia'
import { useDatasetsStore } from './datasets.store'

const FilterColorGenerator = scaleOrdinal(schemePastel1);



export const useDataViewStore = (id: string) => defineStore(`dataview-${id}`, {
    state: (): DataviewState => ({
        name: "",
        color: "",
        loading: false,
        selectedSyllable: 0,
        countMethod: CountMethod.Usage,
        moduleIdFilter: [],
        views: {},
        groups: [],
    }),
    getters: {
        selectedSyllableAs: (state) => (countMethod: CountMethod) => {
            const datasetStore = useDatasetsStore();
            const lm = datasetStore.label_map;
            const from = state.countMethod.toLowerCase();
            const to = countMethod.toLowerCase();
            const result = lm.find((row) => row[from] === state.selectedSyllable);
            if (result !== undefined) {
                return result[to];
            } else {
                return -5;
            }
        },
        selectedSyllableMap(state): SyllableMap {
            const datasetStore = useDatasetsStore();
            const lm = datasetStore.label_map;
            const from = state.countMethod.toLowerCase();
            const result = lm.find((row) => row[from] === state.selectedSyllable);
            if (result !== undefined) {
                return {
                    frames: result[CountMethod.Frames.toLowerCase()],
                    usage: result[CountMethod.Usage.toLowerCase()],
                    raw: result[CountMethod.Raw.toLowerCase()],
                };
            } else {
                throw new Error(`Syllable ${state.selectedSyllable} not found in label map`);
            }
        },
        selectedSyllables(state): number[] {
            let syllables: number[];
            if (state.moduleIdFilter.length === 0) {
                syllables = this.availableModuleIds;
            } else {
                syllables = state.moduleIdFilter;
            }
            return syllables;
        },
        selectedGroups(state): string[] {
            return state.groups.filter((group) => group.selected).map((group) => group.name);
        },
        selectedGroupColors(state): string[] {
            return state.groups.filter((group) => group.selected).map((group) => group.color);
        },
        availableModuleIds(state): number[] {
            const datasetStore = useDatasetsStore();
            if (state.countMethod === CountMethod.Usage) {
                return datasetStore.availableUsageModuleIds
            } else if (state.countMethod === CountMethod.Frames) {
                return datasetStore.availableFramesModuleIds
            }
            return [];
        },
        availableGroupNames(state): string[] {
            const datasetStore = useDatasetsStore();
            return datasetStore.groups
        },
    },
    actions: {
        setView(payload: DataviewPayload) {
            this.loading = true;
            if (payload.countMethod) {
                this.switchCountMethod(payload.countMethod);
            }
            if (payload.selectedSyllable) {
                this.selectedSyllable = payload.selectedSyllable;
            }
            if (payload.groups) {
                this.groups.splice(0, this.groups.length, ...payload.groups);
            }
            if (payload.moduleIdFilter) {
                this.moduleIdFilter = payload.moduleIdFilter;
            }
            this.loading = false;
        },
        publishDataset(payload: PublishDatasetPayload) {
            this.views[`${payload.owner}/${payload.name}`] = payload; // Direct assignment
        },
        unpublishDataset(payload: UnpublishDatasetPayload) {
            delete this.views[`${payload.owner}/${payload.name}`]; // Use `delete` keyword
        },
        serialize(): DataViewRecord {
            return {
                color: this.color,
                name: this.name,
                countMethod: this.countMethod,
                groups: this.groups,
                moduleIdFilter: this.moduleIdFilter,
                selectedSyllable: this.selectedSyllable,
            };
        },
        async load(payload: DataViewRecord) {
            this.loading = true;
            this.name = payload.name;
            this.color = payload.color;
            this.countMethod = payload.countMethod;
            this.selectedSyllable = payload.selectedSyllable;
            this.moduleIdFilter = payload.moduleIdFilter;
            this.groups.splice(0, this.groups.length, ...payload.groups);
            this.loading = false;
        },
        switchCountMethod(payload: CountMethod) {
            const datasetStore = useDatasetsStore();
            const newSelectedSyllable = this.selectedSyllableAs(payload);

            const lm = datasetStore.label_map;
            const from = this.countMethod.toLowerCase();
            const filterSyllables = this.moduleIdFilter.map((id) => {
                const result = lm.find((row) => row[from] === id);
                if (result !== undefined) {
                    return result[payload.toLocaleLowerCase()];
                } else {
                    throw new Error(`Syllable ${id} not found in label map`);
                }
            });

            this.countMethod = payload;
            this.moduleIdFilter.splice(0, this.moduleIdFilter.length, ...filterSyllables);
            this.selectedSyllable = newSelectedSyllable;
        },
        async updateModuleIdFilters(payload: number[]) {
            this.moduleIdFilter.splice(0, this.moduleIdFilter.length, ...payload);

            if (this.moduleIdFilter.length > 0 &&
                !this.moduleIdFilter.includes(this.selectedSyllable)
            ) {
                this.selectedSyllable = this.moduleIdFilter[0];
            }
        },
        async initialize() {
            const datasetStore = useDatasetsStore();
            const namespace = this.$id;
            const name = "filter" + namespace?.split("-")[1];
            this.name = name;
            this.color = FilterColorGenerator(name);

            const colorScale = scaleOrdinal(schemeDark2);
            this.groups.length = 0; // Clear the groups array before populating it
            for (const group of this.availableGroupNames) {
                this.groups.push({
                    name: group,
                    color: colorScale(group),
                    selected: true,
                });
            }

            datasetStore.$onAction(({ name, after }) => {
                after((result) => {
                    if (name === "setData") {
                        this.initialize();
                    }
                });
            });
        },
    },
})();

