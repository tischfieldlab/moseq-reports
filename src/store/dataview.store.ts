import { RootState } from '@/store/root.types';
import { Module } from 'vuex';
import Vue from 'vue';
import DataFrame from 'dataframe-js';
import { schemeDark2 } from 'd3-scale-chromatic';
import {scaleOrdinal} from 'd3-scale';

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
        view: (state, getters, rootState) => {
            // console.log('dataview/view running');
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

            const excludeGroups: string[] = [];
            for (const g of getters.availableGroups) {
                if (!state.selectedGroups.includes(g)) {
                    excludeGroups.push(g);
                }
            }

            const dfClone = new DataFrame(dfData.data, dfData.columns);
            return dfClone.filter((row: any) => !excludeGroups.includes(row.get('group')));
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
        setCountMethod(state, countMethod: CountMethod) {
            state.countMethod = countMethod;
        },
        setSelectedSyllable(state, selectedSyllable: number) {
            state.selectedSyllable = selectedSyllable;
        },
        setSelectedGroups(state, groups: string[]) {
            Vue.set(state, 'selectedGroups', [...groups]);
        },
        setSelectedGroupColors(state, colors: string[]) {
            Vue.set(state, 'groupColors', [...colors]);
        },
    },
    actions: {
        initialize(context) {
            const groups = context.getters.availableGroups;
            context.commit('setSelectedGroups', groups);

            const colorScale = scaleOrdinal(schemeDark2);
            context.commit('setSelectedGroupColors', groups.map((g: string) => colorScale(g)));
        },
    },
};
export default DataviewModule;
