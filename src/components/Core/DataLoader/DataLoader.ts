


import { spawn, Pool, Worker } from 'threads';
import {DataLoaderWorker} from './Worker';
import { Operation } from './DataLoader.types';
import os from 'os';


if (module.hot) {
    module.hot?.addDisposeHandler(async () => {
        await pool.terminate();
        cache = {};
    });
}
const nump = os.cpus().length - 1 || 1;
// console.log(`creating pool with ${nump} workers.`);
const pool = Pool(() => spawn<DataLoaderWorker>(new Worker('./Worker.ts')), nump);
let cache = {};

export default function LoadData(path: string, operations: Operation[], debug?: boolean) {
    const cacheName = JSON.stringify(arguments);
    if (!cache.hasOwnProperty(cacheName)) {
        const tsk = pool.queue(async (loader) => loader.LoadJson(path, operations, debug))
                    .then((result) => {
                        cache[cacheName] = Object.freeze(result);
                        return result;
                    });
        return tsk;
    } else {
        return Promise.resolve()
                      .then(() => cache[cacheName]);
    }
}
