import { Operation } from "./DataLoader.types";
import os from "os";
import LRU from "lru-cache";
import sizeof from "object-sizeof";
import workerpool from "workerpool";

import {
    readFileContents,
    mapColumns,
    filterBy,
    sortBy,
    aggregate,
    getParser,
    pluck,
    keys,
    values,
} from "./DataLoader.lib";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { DataLoaderWorker } from "./Worker";



const numWorkers = os.cpus().length - 1 || 1; // Number of workers to use
console.log(`Creating pool with ${numWorkers} workers.`);
const pool = workerpool.pool(join(dirname(fileURLToPath(import.meta.url)), "dataserverWorker.js"), {
    minWorkers: 3,
    maxWorkers: numWorkers,
    workerType: "thread",

});
console.log(pool.stats());

function createCache() {
    return new LRU<string, any>({
        maxSize: 1024 * 1024 * 1024, // 1GB
        sizeCalculation: (item) => sizeof(item),
        allowStale: true,
    });
}

let cache = createCache();

/**
 * Loads data using the worker pool and caches results.
 * @param path - The path to the JSON data file.
 * @param operations - A list of operations to perform on the data.
 * @param debug - Optional debugging flag.
 * @returns A Promise resolving to the processed data.
 */
export default async function LoadData(
    path: string,
    operations: Operation[],
    debug?: boolean
): Promise<any> {

    const cacheKey = JSON.stringify(arguments);
    if (cache.has(cacheKey)) {
        console.log("Cache hit for key:", cacheKey);
        return cache.get(cacheKey);
    }

    try {
        // Cache and return the final result
        const finalResult = await pool.proxy<DataLoaderWorker>().then((worker) => {
            return worker.LoadData(path, operations, debug);
        })
        cache.set(cacheKey, Object.freeze(finalResult));
        return finalResult;
    } catch (error) {
        console.error("Error loading data:", error);
        throw error;
    }
}
