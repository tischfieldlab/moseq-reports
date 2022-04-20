import { expose } from "threads/worker";
import hcluster from "hclusterjs";
import kmeans from "node-kmeans";
import { groupby } from "../../../util/Array";
import {
    ClusterOptions,
    HClusterOptions,
    KClusterOptions,
    OrderingType,
} from "./ClusteredHeatmap.types";

const exposedMethods = {
    clusterColumns(
        df: object[],
        colKey: string,
        valKey: string,
        options: ClusterOptions
    ) {
        const grouped = groupby(df, (item) => item[colKey].toString());
        const toCluster = Object.entries(grouped).map(([column, vals]) => {
            return {
                name: column,
                values: vals.map((v) => v[valKey]),
            };
        });
        if (options.type === OrderingType.HCluster) {
            return perform_hcluster(toCluster, options);
        } else if (options.type === OrderingType.KCluster) {
            return perform_kmeans_cluster(toCluster, options);
        }
    },
    clusterRows(
        df: object[],
        rowKey: string,
        valKey: string,
        options: ClusterOptions
    ) {
        const grouped = groupby(df, (item) => item[rowKey].toString());
        const toCluster = Object.entries(grouped).map(([row, vals]) => {
            return {
                name: row,
                values: vals.map((v) => v[valKey]),
            };
        });
        if (options.type === OrderingType.HCluster) {
            return perform_hcluster(toCluster, options);
        } else if (options.type === OrderingType.KCluster) {
            return perform_kmeans_cluster(toCluster, options);
        }
    },
};
expose(exposedMethods);
export type ClusterWorker = typeof exposedMethods;

interface ClusterInputData {
    name: string;
    values: number[];
}

function perform_hcluster(
    data: ClusterInputData[],
    options: HClusterOptions,
    key: string = "values"
) {
    return hcluster()
        .distance(options.distance) // support for 'euclidean' and 'angular'
        .linkage(options.linkage) // support for 'avg', 'max' and 'min'
        .posKey(key) // object key holding value
        .data(data) // pass in an array of objects
        .tree(); // finally return the tree
}

function perform_kmeans_cluster(
    data: ClusterInputData[],
    options: KClusterOptions,
    key: string = "values"
) {
    return (async () =>
        await new Promise((resolve, reject) => {
            kmeans.clusterize(
                data.map((itm) => itm[key]),
                options,
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        }))();
}
