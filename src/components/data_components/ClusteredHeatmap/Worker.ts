import { expose } from 'threads/worker';
import hcluster from 'hclusterjs';
import DataFrame from 'dataframe-js';


interface SyllableRow {
    name: string;
    usage: number[];
}

const exposedMethods = {
    clusterGroups(df, distance, linkage) {
        df = new DataFrame(df, Object.getOwnPropertyNames(df));
        df = df.groupBy('group');

        const sylUsage = new Array<SyllableRow>();
        for (const g of df) {
            sylUsage.push({
                name: g.groupKey.group,
                usage: g.group.select('usage').toArray().flat() as [],
            });
        }
        return cluster(sylUsage, distance, linkage);
    },
    clusterSyllables(df, distance, linkage) {
        df = new DataFrame(df, Object.getOwnPropertyNames(df));
        const sylUsage = new Array<SyllableRow>();
        for (const sidg of df.groupBy('syllable')) {
            sylUsage.push({
                name: sidg.groupKey.syllable,
                usage: sidg.group.select('usage').toArray().flat() as [],
            });
        }
        return cluster(sylUsage, distance, linkage);
    },
};
expose(exposedMethods);
export type ClusterWorker = typeof exposedMethods;

function cluster(data: any[], distance = 'euclidean', linkage = 'avg', key = 'usage') {
    const clustering = hcluster()
        .distance(distance) // support for 'euclidean' and 'angular'
        .linkage(linkage)   // support for 'avg', 'max' and 'min'
        .posKey(key)        // object key holding value
        .data(data);        // pass in an array of objects

    const tree = clustering.tree();

    return tree;
}
