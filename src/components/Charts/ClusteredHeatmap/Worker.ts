import { expose } from 'threads/worker';
import hcluster from 'hclusterjs';
import {groupby} from '@/util/Array';
import {HeatmapTile} from './ClusterHeatmap.types';


const exposedMethods = {
    clusterColumns(df, colKey, valKey, distance, linkage) {
        const grouped = groupby(df as HeatmapTile[], (item) => item[colKey]);
        const toCluster = Object.entries(grouped).map(([column, vals]) => {
            return {
                name: column,
                values: vals.map((v) => v[valKey]),
            };
        });
        return cluster(toCluster, distance, linkage);
    },
    clusterRows(df, rowKey, valKey, distance, linkage) {
        const grouped = groupby(df as HeatmapTile[], (item) => item[rowKey].toString());
        const toCluster = Object.entries(grouped).map(([row, vals]) => {
            return {
                name: row,
                values: vals.map((v) => v[valKey]),
            };
        });
        return cluster(toCluster, distance, linkage);
    },
};
expose(exposedMethods);
export type ClusterWorker = typeof exposedMethods;

function cluster(data: any[], distance = 'euclidean', linkage = 'avg', key = 'values') {
    return hcluster()
        .distance(distance) // support for 'euclidean' and 'angular'
        .linkage(linkage)   // support for 'avg', 'max' and 'min'
        .posKey(key)        // object key holding value
        .data(data)         // pass in an array of objects
        .tree();            // finally return the tree
}
