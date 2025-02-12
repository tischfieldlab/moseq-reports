import { spawn, Pool, Worker, ModuleThread } from "threads";
import { DataLoaderWorker } from "./Worker";
import { Operation } from "./DataLoader.types";
import os from "os";
import LRU from "lru-cache";
import sizeof from "object-sizeof";


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



const numWorkers = os.cpus().length - 1 || 1; // Number of workers to use
console.log(`Creating pool with ${numWorkers} workers.`);
// Resolve worker file path and convert URL to string
//const workerPath = new Worker((new URL("./assets/worker.ts", import.meta.url).toString()));

//const pool = Pool(() => spawn<DataLoaderWorker>(workerPath), numWorkers);
//console.log("pool initialized", pool);
//console.log("pool",pool)
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

  //const cacheKey = JSON.stringify({ path, operations, debug });
  const cacheKey = JSON.stringify({
    path,
    operations: operations.map((op) => {
      if (op.type === "filter") {
        // Ensure syllable remains consistent in the cache key
        op.filters.syllable = op.filters.syllable.map(Number);
      }
      return op;
    }),
    debug,
  });
  //console.log("Cache key:", cacheKey);
  //debug = true;
  if (cache.has(cacheKey)) {
    console.log("Cache hit for key:", cacheKey);
    return cache.get(cacheKey);
  }

  try {
    // Read and parse the file
    const parsedData = await readFileContents(path)
      .then((buffer) => buffer.toString())
      .then((data) => getParser(path)(data));
      //console.log("Parsed Data:", parsedData);
    if (debug) {
      console.log("Parsed data:", parsedData);
    }

    // Process operations
    let result = Promise.resolve(parsedData);

    for (const operation of operations) {
      if (debug) {
        console.log("Applying operation:", operation.type);
      }

      switch (operation.type) {
        case "pluck":
          result = result.then((data) => pluck(data, operation));
          break;
        case "keys":
          result = result.then((data) => keys(data, operation));
          break;
        case "values":
          result = result.then((data) => values(data, operation));
          break;
        case "map":
          result = result.then((data) => mapColumns(data, operation));
          break;
        case "filter":
          result = result.then((data) => filterBy(data, operation));
          break;
        case "sort":
          result = result.then((data) => sortBy(data, operation));
          break;
        case "aggregate":
          result = result.then((data) => aggregate(data, operation));
          break;
        default:
          throw new Error(`Unsupported operation '${operation}'`);
      }

      if (debug) {
        result = result.then((data) => {
          console.log("Result after operation:", operation.type, data);
          return data;
        });
      }
    }

    // Cache and return the final result
    const finalResult = await result;
    cache.set(cacheKey, Object.freeze(finalResult));
    return finalResult;
  } catch (error) {
    console.error("Error loading data:", error);
    throw error;
  }
}


// Handle HMR for Vue 3
/*
if (import.meta.hot) {
  import.meta.hot.dispose(async () => {
    await pool.terminate();
    cache = createCache();
  });
}*/
