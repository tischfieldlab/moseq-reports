import { RootState } from '@/store/root.types';
import { Module } from 'vuex';
import DataFrame from 'dataframe-js';
import { schemeDark2 } from 'd3-scale-chromatic';
import {scaleOrdinal} from 'd3-scale';
import {DataviewWorker} from './dataview.worker';
import { spawn, Worker, ModuleThread } from 'threads';
import store from './root.store';
import { getModuleNamespace } from '@/util/Vuex';


export enum CountMethod {
    Usage = 'Usage',
    Frames = 'Frames',
}

interface DataviewState {
    loading: boolean;
    countMethod: CountMethod;

    selectedGroups: string[];
    groupColors: string[];

    selectedSyllable: number;
    view: any;
}

interface DataviewPayload {
    countMethod?: CountMethod;
    selectedGroups?: string[];
    groupColors?: string[];
    view?: any;
}

interface SelectedGroupsPayload {
    groups?: string[];
    colors?: string[];
}

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
            selectedSyllable: 0,
            view: null,
        };
    },
    getters: {
        selectedSyllableAs: (state, getters, rootState) => (countMethod: CountMethod) => {
            const lmd = (rootState as any).datasets.label_map;
            const lm = new DataFrame(lmd.data, lmd.columns);
            const from = state.countMethod.toLowerCase();
            const to = countMethod.toLowerCase();
            return lm.find({[from]: state.selectedSyllable}).get(to);
        },
        view: (state, getters, rootState) => {
            if (state.view !== null) {
                return new DataFrame(state.view.data, state.view.columns);
            }
            return null;
        },
        aggregateView: (state, getters) => {
            if (getters.view !== null) {
                return getters.view
                              .groupBy('syllable', 'group')
                              .aggregate((g: any) => g.stat.mean('usage'))
                              .rename('aggregation', 'usage');
            } else {
                return null;
            }
        },
        maxSyllable: (state, getters) => {
            const view = getters.view;
            if (view === null) {
                return 0;
            }
            return view.distinct('syllable').toArray().length;
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

                payload.view = await worker.filterGroups(dfData, payload.selectedGroups);
                context.commit('setView', payload);
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.warn(e);
            } finally {
                context.commit('setLoading', false);
            }
        },
        initialize(context) {
            const groups = context.getters.availableGroups;
            const colorScale = scaleOrdinal(schemeDark2);
            context.dispatch('updateView', {
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

