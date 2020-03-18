import { RootState } from '@/store/root.types';
import { Module } from 'vuex';
import DataFrame from 'dataframe-js';
import { schemeDark2 } from 'd3-scale-chromatic';
import {scaleOrdinal} from 'd3-scale';
import {DataviewWorker} from './dataview.worker';
import { spawn, Worker, ModuleThread } from 'threads';
import store from './root.store';


export enum CountMethod {
    Usage = 'Usage',
    Frames = 'Frames',
}

interface DataviewState {
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
            return getters.view.groupBy('syllable', 'group')
                               .aggregate((g: any) => g.stat.mean('usage'))
                               .rename('aggregation', 'usage');
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
            context.dispatch('updateView', {
                selectedGroups: payload.groups,
                groupColors: payload.colors,
            } as DataviewPayload);
        },
        async updateView(context, payload: DataviewPayload) {
            const countMethod = payload.countMethod || context.state.countMethod;
            const selectedGroups = payload.selectedGroups || context.state.selectedGroups;

            let dfData: any;
            if (countMethod === CountMethod.Usage) {
                dfData = (context.rootState as any).datasets.usageByUsage;
            } else if (countMethod === CountMethod.Frames) {
                dfData = (context.rootState as any).datasets.usageByFrames;
            } else {
                throw new Error('Unknown Count Method ' + countMethod);
            }

            if (dfData === null) {
                return null;
            }

            payload.view = await worker.filterGroups(dfData, selectedGroups);
            context.commit('setView', payload);
        },
        initialize(context) {
            const groups = context.getters.availableGroups;
            const colorScale = scaleOrdinal(schemeDark2);
            context.dispatch('updateView', {
                selectedGroups: groups,
                groupColors: groups.map((g: string) => colorScale(g)),
            } as DataviewPayload).then(() => bindStore());
        },
    },
};

if ((store.state as any).dataview === undefined) {
    store.registerModule('dataview', DataviewModule, {});
}
function bindStore() {
    store.watch(
        (state) => {
            const datasets = (state as any).datasets;
            return {
                usageByUsage: datasets.usageByUsage,
                usageByFrames: datasets.usageByFrames,
            };
        },
        async () => {
            store.dispatch('dataview/updateView', {});
        },
    );
}

