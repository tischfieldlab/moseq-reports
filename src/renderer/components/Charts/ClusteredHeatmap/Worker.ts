import {groupby} from '@render/util/Array';
import { HClusterDistance, HClusterOptions, KClusterOptions } from './ClusteredHeatmap.types';
import { agnes, Cluster } from 'ml-hclust';
import * as mldistance from 'ml-distance';
import {kmeans, } from 'ml-kmeans';

export interface HClusterResult {
    keys: string[];
    cluster: Cluster;
}

interface ClusterInputData {
    name: string;
    values: number[];
}

export function hCluster(df: object[], idKey: string, valKey: string, options: HClusterOptions): HClusterResult {
    const grouped = groupby(df, (item) => item[idKey].toString());
    const toCluster = Object.entries(grouped).map(([id, vals]) => {
        return {
            name: id,
            values: vals.map((v) => v[valKey]),
        } as ClusterInputData;
    });

    const cluster = agnes(toCluster.map(itm => itm.values), {
        distanceFunction: get_distance(options.distance), // support for 'euclidean' and 'angular'
        method: options.linkage,   // support for 'avg', 'max' and 'min'
        isDistanceMatrix: false,        // object key holding value
    });

    return {
        keys: toCluster.map(itm => itm.name),
        cluster: cluster
    }
}

function get_distance(distance: HClusterDistance): (a: number[], b: number[]) => number {
    return mldistance.distance[distance.toString()]
}

console.log(mldistance.distance);


export interface KClusterResult {
    keys: string[];
    clusters: number[];
    centroids: number[][];
}
export function kCluster(df: object[], idKey: string, valKey: string, options: KClusterOptions) {
    const grouped = groupby(df, (item) => item[idKey].toString());
    const toCluster = Object.entries(grouped).map(([column, vals]) => {
        return {
            name: column,
            values: vals.map((v) => v[valKey]),
        };
    });
    
    const result = kmeans(toCluster.map(itm => itm.values), options.k, {});

    return {
        keys: toCluster.map(itm => itm.name),
        clusters: result.clusters,
        centroids: result.centroids
    };
}
