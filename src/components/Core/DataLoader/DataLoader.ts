


import { spawn, Pool, Worker } from 'threads';
import {DataLoaderWorker} from './Worker';


const pool = Pool(() => spawn<DataLoaderWorker>(new Worker('./Worker.ts')), 2 /* optional size */);


export function LoadData(path: string, columns: Array<string|[string, string]>) {
    return pool.queue((loader) => loader.LoadJson(path, columns));
}
