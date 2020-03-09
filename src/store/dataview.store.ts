import { RootState } from '@/store/root.types';
import { Module } from 'vuex';
import Vue from 'vue';
import DataFrame from 'dataframe-js';
import { schemeDark2 } from 'd3-scale-chromatic';
import {scaleOrdinal} from 'd3-scale';
import rootStore from './root.store';

export enum CountMethod {
    Usage = 'Usage',
    Frames = 'Frames',
}

interface DataviewState {
    countMethod: CountMethod;

    selectedGroups: string[];
    groupColors: string[];

    selectedSyllable: number;
}

interface SelectedGroupsPayload {
    groups?: string[];
    colors?: string[];
}

const DataviewModule: Module<DataviewState, RootState> = {
    namespaced: true,
    state() {
        return {
            countMethod: CountMethod.Usage,
            selectedGroups: [],
            groupColors: [],
            selectedSyllable: 0,
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
            let dfData: any;
            if (state.countMethod === CountMethod.Usage) {
                dfData = (rootState as any).datasets.usageByUsage;
            } else if (state.countMethod === CountMethod.Frames) {
                dfData = (rootState as any).datasets.usageByFrames;
            } else {
                throw new Error('Unknown Count Method ' + state.countMethod);
            }

            if (dfData === null) {
                return null;
            }

            const dfClone = new DataFrame(dfData.data, dfData.columns);
            return dfClone.filter((row: any) => state.selectedGroups.includes(row.get('group')));
        },
        aggregateView: (state, getters) => {
            return getters.view.groupBy('syllable', 'group')
                               .aggregate((g: any) => g.stat.mean('usage'))
                               .rename('aggregation', 'usage');
        },
        transitions: (state, getters, rootState) => {
            let dfData: any;
            if (state.countMethod === CountMethod.Usage) {
                dfData = (rootState as any).datasets.transitionsByUsage;
            } else if (state.countMethod === CountMethod.Frames) {
                dfData = (rootState as any).datasets.transitionsByFrames;
            } else {
                throw new Error('Unknown Count Method ' + state.countMethod);
            }

            if (dfData === null) {
                return null;
            }
            return dfData;
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
export default DataviewModule;
