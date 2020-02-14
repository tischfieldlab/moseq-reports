import { RootState } from '@/store/root.types';
import { Module } from 'vuex';
import { CountMethod } from '@/models/DataModel';

interface DataviewState {
    countMethod: CountMethod;

    availableGroups: string[];
    selectedGroups: string[];
    groupColors: string[];

    selectedSyllable: number;
}

const DataviewModule: Module<DataviewState, RootState> = {
    namespaced: true,
    state() {
        return {
            countMethod: CountMethod.Usage,
            availableGroups: [],
            selectedGroups: [],
            groupColors: [],
            selectedSyllable: 0,
        };
    },
    getters: {
        view: (state, getters, rootState) => {
            const excludeGroups: string[] = [];
            for (const g of state.availableGroups) {
                if (!state.selectedGroups.includes(g)) {
                    excludeGroups.push(g);
                }
            }

            let dfClone: any;
            if (state.countMethod === CountMethod.Usage) {
                dfClone = (rootState as any).datasets.usageByUsage;
            } else if (state.countMethod === CountMethod.Frames) {
                dfClone = (rootState as any).datasets.usageByFrames;
            } else {
                throw new Error('Unknown Count Method ' + state.countMethod);
            }
            return dfClone.filter((row: any) => !excludeGroups.includes(row.get('group')));
        },
        aggregateView: (state, getters) => {
            return getters.view.groupBy('syllable', 'group')
                               .aggregate((g: any) => g.stat.mean('usage'))
                               .rename('aggregation', 'usage');
        },
        maxSyllable: (state, getters) => {
            return getters.view.distinct('syllable').toArray().length;
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
            state.selectedGroups = groups;
        },
        setSelectedGroupColors(state, colors: string[]) {
            state.groupColors = colors;
        },
    },
};
export default DataviewModule;
