import { expose } from 'threads/worker';
import DataFrame from 'dataframe-js';


const exposedMethods = {
    filterGroups(df, groups: string[]) {
        df = new DataFrame(df.data, df.columns);
        df = df.filter((row: any) => groups.includes(row.get('group')));
        df = df.toDict();
        return {data: df, columns: Object.getOwnPropertyNames(df)};
    },
};
expose(exposedMethods);
export type DataviewWorker = typeof exposedMethods;
