import { expose } from 'threads/worker';
import DataFrame from 'dataframe-js';

interface ViewFilters {
    groups: string[];
    moduleId: number[];
}

const exposedMethods = {
    filterGroups(df, filters: ViewFilters) {
        df = new DataFrame(df.data, df.columns);
        df = df.filter((row: any) => filters.groups.includes(row.get('group')));
        if (filters.moduleId.length > 0) {
            df = df.filter((row: any) => filters.moduleId.includes(row.get('syllable')));
        }
        df = df.toDict();
        return {data: df, columns: Object.getOwnPropertyNames(df)};
    },
};
expose(exposedMethods);
export type DataviewWorker = typeof exposedMethods;
