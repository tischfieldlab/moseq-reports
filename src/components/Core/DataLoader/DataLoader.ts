


import { spawn, Pool, Worker } from 'threads';
import {DataLoaderWorker} from './Worker';
import { SortSpec } from './DataLoader.types';




const pool = Pool(() => spawn<DataLoaderWorker>(new Worker('./Worker.ts')), 2 /* optional size */);


export default function LoadData(path: string,
                                 columns: Array<string|[string, string]>,
                                 sorting?: SortSpec|undefined,
                                 filter?: {[key: string]: any[]}|undefined) {

    return pool.queue((loader) => loader.LoadJson(path, columns, sorting, filter));
}
