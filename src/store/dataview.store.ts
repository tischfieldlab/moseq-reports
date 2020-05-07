import { RootState } from '@/store/root.types';
import { Module } from 'vuex';
import DataFrame from 'dataframe-js';
import { schemeDark2 } from 'd3-scale-chromatic';
import { scaleOrdinal } from 'd3-scale';
import { DataviewWorker } from './dataview.worker';
import { spawn, Worker, ModuleThread } from 'threads';
import store from './root.store';
import { getModuleNamespace } from '@/util/Vuex';
import { DataviewState, CountMethod, DataviewPayload, SelectedGroupsPayload } from '@/store/dataview.types';


let worker: ModuleThread<DataviewWorker>;
(async () => {
    worker = await spawn<DataviewWorker>(new Worker('./dataview.worker.ts'));
})();


const DataviewModule: Module<DataviewState, RootState> = {
    namespaced: true,
    state() {
        return {
            loading: false,
            countMethod: CountMethod.Usage,
            selectedGroups: [],
            groupColors: [],
            moduleIdFilter: [],
            selectedSyllable: 0,
            view: null,
        };
    },
    getters: {
        selectedSyllableAs: (state, _, rootState) => (countMethod: CountMethod) => {
            const lmd = (rootState as any).datasets.label_map;
            const lm = new DataFrame(lmd.data, lmd.columns);
            const from = state.countMethod.toLowerCase();
            const to = countMethod.toLowerCase();
            const result = lm.find({[from]: state.selectedSyllable}).get(to) || -1;
            return result;
        },
        view: (state) => {
            if (state.view !== null) {
                return new DataFrame(state.view.data, state.view.columns);
            }
            return null;
        },
        aggregateView: (_, getters) => {
            if (getters.view !== null) {
                return getters.view
                              .groupBy('syllable', 'group')
                              .aggregate((g: any) => g.stat.mean('usage'))
                              .rename('aggregation', 'usage');
            } else {
                return null;
            }
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
        setLoading(state, loading: boolean) {
            state.loading = loading;
        },
        setGroupColors(state, groupColors: string[]) {
            state.groupColors = groupColors;
        },
        setView(state, payload: DataviewPayload) {
            state.view = payload.view;
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
                state.moduleIdFilter = payload.moduleIdFilter;
            }
        },
        setSelectedSyllable(state, selectedSyllable: number) {
            state.selectedSyllable = selectedSyllable;
        },
    },
    actions: {
        switchCountMethod(context, payload: CountMethod) {
            const newSyllable = context.getters.selectedSyllableAs(payload);
            context.dispatch('updateView', {
                countMethod: payload,
            } as DataviewPayload);
            context.commit('setSelectedSyllable', newSyllable);
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

                let dfData: any;
                if (payload.countMethod === CountMethod.Usage) {
                    dfData = (context.rootState as any).datasets.usageByUsage;
                } else if (payload.countMethod === CountMethod.Frames) {
                    dfData = (context.rootState as any).datasets.usageByFrames;
                } else {
                    throw new Error('Unknown Count Method ' + payload.countMethod);
                }

                if (dfData === null) {
                    return null;
                }

                payload.view = await worker.filterGroups(dfData, {
                    groups: payload.selectedGroups,
                    moduleId: payload.moduleIdFilter,
                });
                context.commit('setView', payload);
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.warn(e);
            } finally {
                context.commit('setLoading', false);
            }
        },
        async initialize(context) {
            const groups = context.getters.availableGroups;
            const colorScale = scaleOrdinal(schemeDark2);
            await context.dispatch('updateView', {
                selectedGroups: groups,
                groupColors: groups.map((g: string) => colorScale(g)),
            } as DataviewPayload).then(() => bindStore(getModuleNamespace(store, context.state)));
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

