import { RootState } from '@/store/root.types';
import { Module } from 'vuex';
import Vue from 'vue';
import DataFrame from 'dataframe-js';
import { schemeDark2 } from 'd3-scale-chromatic';
import {scaleOrdinal} from 'd3-scale';
import {DataviewWorker} from './dataview.worker';
import { spawn, Thread, Worker, ModuleThread } from 'threads';
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
        setView(state, payload: any) {
            state.view = payload;
        },
        setCountMethod(state, countMethod: CountMethod) {
            state.countMethod = countMethod;
        },
        setSelectedSyllable(state, selectedSyllable: number) {
            state.selectedSyllable = selectedSyllable;
        },
        setSelectedGroups(state, payload: SelectedGroupsPayload) {
            if (payload.groups) {
                Vue.set(state, 'selectedGroups', [...payload.groups]);
            }
            if (payload.colors) {
                Vue.set(state, 'groupColors', [...payload.colors]);
            }
        },
    },
    actions: {
        switchCountMethod(context, payload: CountMethod) {
            const newSyllable = context.getters.selectedSyllableAs(payload);
            context.commit('setCountMethod', payload);
            context.commit('setSelectedSyllable', newSyllable);
        },
        async updateView(context) {
            let dfData: any;
            if (context.state.countMethod === CountMethod.Usage) {
                dfData = (context.rootState as any).datasets.usageByUsage;
            } else if (context.state.countMethod === CountMethod.Frames) {
                dfData = (context.rootState as any).datasets.usageByFrames;
            } else {
                throw new Error('Unknown Count Method ' + context.state.countMethod);
            }

            if (dfData === null) {
                return null;
            }

            const df = await worker.filterGroups(dfData, context.state.selectedGroups);
            context.commit('setView', df);
        },
        initialize(context) {
            const groups = context.getters.availableGroups;
            const colorScale = scaleOrdinal(schemeDark2);
            context.commit('setSelectedGroups', {
                groups,
                colors: groups.map((g: string) => colorScale(g)),
            });
        },
    },
};
// export default DataviewModule;
if ((store.state as any).dataview === undefined) {
    store.registerModule('dataview', DataviewModule, {});

    store.watch(
        (state) => {
            const datasets = (state as any).datasets;
            const dataview = (state as any).dataview;
            return {
                countMethod: dataview.countMethod,
                selectedGroups: dataview.selectedGroups,
                usageByUsage: datasets.usageByUsage,
                usageByFrames: datasets.usageByFrames,
            };
        },
        async () => {
            store.dispatch('dataview/updateView');
        },
    );
}

