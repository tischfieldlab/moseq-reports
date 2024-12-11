// import { spawn, Pool, Worker } from "threads";
import { DataLoaderWorker } from "./Worker";
import { Operation } from "./DataLoader.types";
import os from "os";
import LRU from "lru-cache";
import sizeof from "object-sizeof";

if (import.meta.hot) {
  // Do whatever we need to do for threads...
}

// if (module.hot) {
//   module.hot?.addDisposeHandler(async () => {
//     await pool.terminate();
//     cache = createCache();
//   });
// }
const nump = os.cpus().length - 1 || 1;
// console.log(`creating pool with ${nump} workers.`);
// const pool = Pool(() => spawn<DataLoaderWorker>(new Worker("./Worker.ts")), nump);

function createCache() {
  return new LRU({
    max: 1024 * 1024 * 1024, // 1GB
    length: (item, key) => sizeof(item),
    stale: true,
  });
}

let cache = createCache();

export default function LoadData(path: string, operations: Operation[], debug?: boolean) {
  const cacheName = JSON.stringify(arguments);
  if (!cache.hasOwnProperty(cacheName)) {
    // const tsk = pool
    //   .queue(async (loader) => loader.LoadJson(path, operations, debug))
    //   .then((result) => {
    //     cache[cacheName] = Object.freeze(result);
    //     return result;
    //   });
    // return tsk;
  } else {
    return Promise.resolve().then(() => cache[cacheName]);
  }
}
