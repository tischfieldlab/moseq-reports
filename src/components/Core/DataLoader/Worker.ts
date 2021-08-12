import { expose } from 'threads/worker';
import { Operation } from './DataLoader.types';
import { readFileContents, mapColumns, filterBy, sortBy, aggregate, getParser, pluck, keys, values } from './DataLoader.lib';

import LRU from 'lru-cache';
import sizeof from 'object-sizeof';


const cache = new LRU({
    max: 1024 * 1024 * 1024, // 1GB
    length: (item, key) => sizeof(item),
    stale: true,
});

const exposedMethods = {
    async LoadJson(path: string, operations: Operation[], debug?: boolean) {
        const cacheName = path;
        let hit = true;
        if (!cache.has(cacheName)) {
            hit = false;
            const loader = readFileContents(path)
                            .then((buffer) => buffer.toString())
                            .then((data) => getParser(path)(data));

            cache.set(cacheName, await loader);
        }

        if (debug) {
            // tslint:disable-next-line:no-console
            console.log({
                hit,
                keys: cache.keys(),
                size: cache.length,
                count: cache.itemCount,
            });
        }

        let pipe = Promise.resolve(cache.get(cacheName));

        if (debug) {
            pipe = pipe.then((data) => {
                // tslint:disable-next-line:no-console
                console.log('loaded', data);
                return data;
            });
        }

        for (const operator of operations) {
            switch (operator.type) {
                case 'pluck':
                    pipe = pipe.then((obj) =>  pluck(obj, operator));
                    break;

                case 'keys':
                    pipe = pipe.then((obj) =>  keys(obj, operator));
                    break;

                case 'values':
                    pipe = pipe.then((obj) =>  values(obj, operator));
                    break;

                case 'map':
                    pipe = pipe.then((obj) => mapColumns(obj, operator));
                    break;

                case 'filter':
                    pipe = pipe.then((obj) => filterBy(obj, operator));
                    break;

                case 'sort':
                    pipe = pipe.then((obj) => sortBy(obj, operator));
                    break;

                case 'aggregate':
                    pipe = pipe.then((obj) =>  aggregate(obj, operator));
                    break;

                default:
                    throw new Error(`unsupported operation '${operator}'`);
            }
            if (debug) {
                pipe = pipe.then((data) => {
                    // tslint:disable-next-line:no-console
                    console.log(operator, data);
                    return data;
                });
            }
        }
        // console.log(pipe);
        return pipe;
    },
};
expose(exposedMethods);
export type DataLoaderWorker = typeof exposedMethods;
