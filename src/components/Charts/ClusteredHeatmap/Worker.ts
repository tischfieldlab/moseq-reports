import { expose } from 'threads/worker';
import hcluster from 'hclusterjs';
import {groupby} from '@/util/Array';
import { HeatmapTile,  ClusterDistance, ClusterLinkage } from './ClusterHeatmap.types';


const exposedMethods = {
    clusterColumns(df, colKey: string, valKey: string, distance: ClusterDistance, linkage: ClusterLinkage) {
        const grouped = groupby(df as HeatmapTile[], (item) => item[colKey]);
        const toCluster = Object.entries(grouped).map(([column, vals]) => {
            return {
                name: column,
                values: vals.map((v) => v[valKey]),
            };
        });
        return cluster(toCluster, distance, linkage);
    },
    clusterRows(df, rowKey: string, valKey: string, distance: ClusterDistance, linkage: ClusterLinkage) {
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

function cluster(data: any[], distance: ClusterDistance = ClusterDistance.Euclidean,
    linkage: ClusterLinkage = ClusterLinkage.Avg, key: string = 'values') {

    return hcluster()
        .distance(distance) // support for 'euclidean' and 'angular'
        .linkage(linkage)   // support for 'avg', 'max' and 'min'
        .posKey(key)        // object key holding value
        .data(data)         // pass in an array of objects
        .tree();            // finally return the tree
}
