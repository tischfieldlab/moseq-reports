import { RootState } from '@/store/root.types';
import { Module } from 'vuex';
import { schemeDark2, schemePastel1  } from 'd3-scale-chromatic';
import { scaleOrdinal } from 'd3-scale';
import store from './root.store';
import { getModuleNamespace } from '@/util/Vuex';
import { DataviewState, CountMethod, DataviewPayload, SelectedGroupsPayload, PublishDatasetPayload, UnpublishDatasetPayload } from '@/store/dataview.types';
import Vue from 'vue';
import { DatasetsState } from './datasets.types';


const FilterColorGenerator = scaleOrdinal(schemePastel1);


const DataviewModule: Module<DataviewState, RootState> = {
    namespaced: true,
    state() {
        return {
            name: '',
            color: '',
            loading: false,
            countMethod: CountMethod.Usage,
            selectedGroups: [],
            groupColors: [],
            moduleIdFilter: [],
            selectedSyllable: 0,
            views: {},
        };
    },
    getters: {
        selectedSyllableAs: (state, _, rootState) => (countMethod: CountMethod) => {
            const lm = ((rootState as any).datasets as DatasetsState).label_map;
            const from = state.countMethod.toLowerCase();
            const to = countMethod.toLowerCase();
            const result = lm.find((row) => row[from] === state.selectedSyllable);
            if (result !== undefined) {
                return result[to];
            } else {
                return -5;
            }
        },
        selectedSyllableMap: (state, _, rootState) => {
            const lm = ((rootState as any).datasets as DatasetsState).label_map;
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
        selectedSyllables: (state, getters) => {
            let syllables;
            if (state.moduleIdFilter.length === 0) {
                syllables = getters.availableModuleIds;
            } else {
                syllables = state.moduleIdFilter;
            }
            return syllables;
        },
        availableModuleIds: (state, getters, rootState, rootGetters) => {
            if (state.countMethod === CountMethod.Usage) {
                return rootGetters['datasets/availableUsageModuleIds'];
            } else if (state.countMethod === CountMethod.Frames) {
                return rootGetters['datasets/availableFramesModuleIds'];
            }
            return [];
        },
        availableGroups: (state, getters, rootState) => {
            return (rootState as any).datasets.groups;
        },
    },
    mutations: {
        setName(state, name: string) {
            state.name = name;
        },
        setColor(state, color: string) {
            state.color = color;
        },
        setLoading(state, loading: boolean) {
            state.loading = loading;
        },
        setGroupColors(state, groupColors: string[]) {
            state.groupColors = groupColors;
        },
        setView(state, payload: DataviewPayload) {
            if (payload.countMethod) {
                state.countMethod = payload.countMethod;
            }
            if (payload.selectedGroups) {
                state.selectedGroups = payload.selectedGroups;
            }
            if (payload.groupColors) {
                state.groupColors = payload.groupColors;
            }
            if (payload.moduleIdFilter) {
                state.moduleIdFilter.splice(0, state.moduleIdFilter.length); // clear the existing array
                state.moduleIdFilter.push(...payload.moduleIdFilter); // add the new elements from payload
            }
        },
        setSelectedSyllable(state, selectedSyllable: number) {
            state.selectedSyllable = selectedSyllable;
        },
        publishDataset(state, payload: PublishDatasetPayload) {
            Vue.set(state.views, `${payload.owner}/${payload.name}`, payload);
        },
        unpublishDataset(state, payload: UnpublishDatasetPayload) {
            Vue.delete(state.views, `${payload.owner}/${payload.name}`);
        },
    },
    actions: {
        serialize(context): any {
            return {
                color: context.state.color,
                name: context.state.name,
                countMethod: context.state.countMethod,
                selectedGroups: context.state.selectedGroups,
                groupColors: context.state.groupColors,
                moduleIdFilter: context.state.moduleIdFilter,
                selectedSyllable: context.state.selectedSyllable,
            };
        },
        async load(context, payload) {
            await context.dispatch('updateView', payload);
            context.commit('setSelectedSyllable', payload.selectedSyllable);
        },
        switchCountMethod(context, payload: CountMethod) {
            // translate the selected syllable to new count method
            const newSelectedSyllable = context.getters.selectedSyllableAs(payload);

            // translate the module id filters to new count method
            const lm = ((context.rootState as any).datasets as DatasetsState).label_map;
            const from = context.state.countMethod.toLowerCase();
            const filterSyllables = context.state.moduleIdFilter.map((id) => {
                const result = lm.find((row) => row[from] === id);
                if (result !== undefined) {
                    return result[payload.toLocaleLowerCase()];
                }
            });

            context.dispatch('updateView', {
                countMethod: payload,
                moduleIdFilter: filterSyllables,
            } as DataviewPayload);
            context.commit('setSelectedSyllable', newSelectedSyllable);
        },
        async updateModuleIdFilters(context, payload: number[]) {
            await context.dispatch('updateView', {
                moduleIdFilter: payload,
            } as DataviewPayload);

            if (context.state.moduleIdFilter.length > 0
            && !context.state.moduleIdFilter.includes(context.state.selectedSyllable)) {
                context.commit('setSelectedSyllable', context.state.moduleIdFilter[0]);
            }
        },
        updateSelectedGroups(context, payload: SelectedGroupsPayload) {
            if (payload.groups === undefined && payload.colors !== undefined) {
                context.commit('setGroupColors', payload.colors);
            } else {
                context.dispatch('updateView', {
                    selectedGroups: payload.groups,
                    groupColors: payload.colors,
                } as DataviewPayload);
            }
        },
        async updateView(context, payload: DataviewPayload) {
            context.commit('setLoading', true);
            try {
                payload.countMethod = payload.countMethod || context.state.countMethod;
                payload.selectedGroups = payload.selectedGroups || context.state.selectedGroups;
                payload.moduleIdFilter = payload.moduleIdFilter || context.state.moduleIdFilter;
                context.commit('setView', payload);
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.warn(e);
            } finally {
                context.commit('setLoading', false);
            }
        },
        async initialize(context) {
            const namespace = getModuleNamespace(store, context.state);
            const name = 'filter' + namespace?.split('/')[1].split('-')[1];
            context.commit('setName', name);
            const groups = context.getters.availableGroups;
            const colorScale = scaleOrdinal(schemeDark2);
            context.commit('setColor', FilterColorGenerator(name));
            await context.dispatch('updateView', {
                selectedGroups: groups,
                groupColors: groups.map((g: string) => colorScale(g)),
            } as DataviewPayload).then(() => bindStore(namespace));
        },
    },
};
export default DataviewModule;


function bindStore(name) {
    store.subscribeAction({
        after: (action, state) => {
            if (action.type === 'datasets/setData') {
                store.dispatch(`${name}/updateView`, {});
            }
        },
    });
}

