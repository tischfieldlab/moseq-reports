import { schemeDark2, schemePastel1 } from "d3-scale-chromatic";
import { scaleOrdinal } from "d3-scale";
import {
  DataviewState,
  CountMethod,
  DataviewPayload,
  SelectedGroupsPayload,
  PublishDatasetPayload,
  UnpublishDatasetPayload,
} from "@store/dataview.types";

import { defineStore, acceptHMRUpdate } from 'pinia'
import {useDatasetsStore} from './datasets.store'

const FilterColorGenerator = scaleOrdinal(schemePastel1);

interface GroupItem {
    name: string;
    color: string;
    selected: boolean;
}

export const useDataViewStore = (id: string) => defineStore(`dataview-${id}`, {
    state: (): DataviewState => ({
        name: "",
        color: "",
        loading: false,
        selectedSyllable: 0,
        countMethod: CountMethod.Usage,
        moduleIdFilter: [] as number[],
        views: {},
        groups: [] as GroupItem[],
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
        selectedSyllableMap(state) {
            const datasetStore = useDatasetsStore();
            const lm = datasetStore.label_map;
            const from = state.countMethod.toLowerCase();
            const result = lm.find((row) => row[from] === state.selectedSyllable);
            if (result !== undefined) {
                return {
                    [CountMethod.Frames.toLowerCase()]: result[CountMethod.Frames.toLowerCase()],
                    [CountMethod.Usage.toLowerCase()]: result[CountMethod.Usage.toLowerCase()],
                    [CountMethod.Raw.toLowerCase()]: result[CountMethod.Raw.toLowerCase()],
                };
            } else {
                return undefined;
            }
        },
        selectedSyllables(state): number[] {
            let syllables;
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
            return useDatasetsStore().groups
        },
    },
    actions: {
        setView(payload: DataviewPayload) {
            this.loading = true;
            if (payload.countMethod) {
                this.countMethod = payload.countMethod;
            }
            if (payload.selectedGroups) {
                this.selectedGroups = payload.selectedGroups;
            }
            if (payload.groupColors) {
                this.groupColors = payload.groupColors;
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
        serialize(): any {
            return {
                color: this.color,
                name: this.name,
                countMethod: this.countMethod,
                groups: this.groups,
                moduleIdFilter: this.moduleIdFilter,
                selectedSyllable: this.selectedSyllable,
            };
        },
        async load(payload) {
            this.loading = true;
            if (payload.countMethod) {
                this.countMethod = payload.countMethod;
            }
            if (payload.selectedGroups) {
                this.selectedGroups = payload.selectedGroups;
            }
            if (payload.groupColors) {
                this.groupColors = payload.groupColors;
            }
            if (payload.moduleIdFilter) {
                this.moduleIdFilter = payload.moduleIdFilter;
            }
            this.selectedSyllable = payload.selectedSyllable;
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
            console.log("Initializing dataview store", this.$id);
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
                    count: 0,
                });
            }

            datasetStore.$onAction(({name, after}) => {
                after((result) => {
                    if (name === "setData") {
                        this.initialize();
                    }
                });
            });
        },
    },
})();

