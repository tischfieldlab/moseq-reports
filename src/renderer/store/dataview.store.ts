import { schemeDark2, schemePastel1 } from "d3-scale-chromatic";
import { scaleOrdinal } from "d3-scale";
import {
  DataviewState,
  CountMethod,
  DataviewPayload,
  SelectedGroupsPayload,
  PublishDatasetPayload,
  UnpublishDatasetPayload,
} from "@render/store/dataview.types";

import { defineStore, acceptHMRUpdate } from 'pinia'
import {useDatasetsStore} from './datasets.store'

const FilterColorGenerator = scaleOrdinal(schemePastel1);



export const useDataViewStore = (id: string) => defineStore(`dataview-${id}`, {
    state: (): DataviewState => ({
        name: "",
        color: "",
        loading: false,
        countMethod: CountMethod.Usage,
        selectedGroups: [],
        groupColors: [],
        moduleIdFilter: [],
        selectedSyllable: 0,
        views: {},
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
        selectedSyllables(state) {
            let syllables;
            if (state.moduleIdFilter.length === 0) {
                syllables = this.availableModuleIds;
            } else {
                syllables = state.moduleIdFilter;
            }
            return syllables;
        },
        availableModuleIds(state) {
            const datasetStore = useDatasetsStore();
            if (state.countMethod === CountMethod.Usage) {
                return datasetStore.availableUsageModuleIds
            } else if (state.countMethod === CountMethod.Frames) {
                return datasetStore.availableFramesModuleIds
            }
            return [];
        },
        availableGroups(state) {
            const datasetStore = useDatasetsStore();
            return datasetStore.groups
        },
    },
    actions: {
        setName(name: string) {
            this.name = name;
        },
        setColor(color: string) {
            this.color = color;
        },
        setLoading(loading: boolean) {
            this.loading = loading;
        },
        setGroupColors(groupColors: string[]) {
            this.groupColors = groupColors;
        },
        setView(payload: DataviewPayload) {
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
        },
        setSelectedSyllable(selectedSyllable: number) {
            this.selectedSyllable = selectedSyllable;
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
                selectedGroups: this.selectedGroups,
                groupColors: this.groupColors,
                moduleIdFilter: this.moduleIdFilter,
                selectedSyllable: this.selectedSyllable,
            };
        },
        async load(payload) {
            await this.updateView(payload);
            this.setSelectedSyllable(payload.selectedSyllable);
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
        
            this.updateView({
                countMethod: payload,
                moduleIdFilter: filterSyllables,
            } as DataviewPayload);
            this.setSelectedSyllable(newSelectedSyllable);
        },
        async updateModuleIdFilters(payload: number[]) {
            await this.updateView({
                moduleIdFilter: payload,
            } as DataviewPayload);
        
            if (
                this.moduleIdFilter.length > 0 &&
                !this.moduleIdFilter.includes(this.selectedSyllable)
            ) {
                this.setSelectedSyllable(this.moduleIdFilter[0]);
            }
        },
        updateSelectedGroups(payload: SelectedGroupsPayload) {
            if (payload.groups === undefined && payload.colors !== undefined) {
                this.setGroupColors(payload.colors);
            } else {
                this.updateView({
                    selectedGroups: payload.groups,
                    groupColors: payload.colors,
                } as DataviewPayload);
            }
        },
        async updateView(payload: DataviewPayload) {
            this.setLoading(true);
            try {
                payload.countMethod = payload.countMethod || this.countMethod;
                payload.selectedGroups = payload.selectedGroups || this.selectedGroups;
                payload.moduleIdFilter = payload.moduleIdFilter || this.moduleIdFilter;
                this.setView(payload);
            } catch (e) {
                console.warn(e);
            } finally {
                this.setLoading(false);
            }
        },
        async initialize() {
            console.log("Initializing dataview store", this.$id);
            const datasetStore = useDatasetsStore();
            const namespace = this.$id;
            const name = "filter" + namespace?.split("-")[1];
            this.setName(name);
            const groups = this.availableGroups;
            const colorScale = scaleOrdinal(schemeDark2);
            this.setColor(FilterColorGenerator(name));
            await this.updateView({
                selectedGroups: groups,
                groupColors: groups.map((g: string) => colorScale(g)),
            } as DataviewPayload)
            .then(() => {
                datasetStore.$onAction(({name, after}) => {
                    after((result) => {
                        if (name === "setData") {
                            this.updateView({});
                        }
                    });
                });
            });
        },
    },
})();

