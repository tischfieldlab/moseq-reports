import { expose } from 'threads/worker';
// tslint:disable no-eval
const fs = eval('require(\'fs\')');
import {ascending} from 'd3-array';


const cache = {};

const exposedMethods = {
    async LoadJson(path: string, columns: Array<string|[string, string]>) {
        if (!fs.existsSync(path)) {
            throw new Error(`Path does not exist: "${path}"`);
        }
        const cacheName = path + JSON.stringify(columns);
        if (!cache.hasOwnProperty(cacheName)) {
            cache[cacheName] = await fs.promises.readFile(path)
                .then((buffer) => {
                    const obj = JSON.parse(buffer.toString());

                    const coldefs = columns.map((c) => {
                        if (typeof c === 'string' || c instanceof String) {
                            return {
                                src: c as string,
                                dest: c as string,
                                idx: (obj.columns as string[]).indexOf(c as string),
                            };
                        } else {
                            return {
                                src: c[0] as string,
                                dest: c[1] as string,
                                idx: (obj.columns as string[]).indexOf(c[0]),
                            };
                        }
                    });

                    return (obj.data as Array<{[col: string]: any}>).map((row) => {
                        return Object.fromEntries(
                            coldefs.map((cd) => {
                                return [cd.dest, row[cd.idx]];
                            }),
                        );
                    });
                });
        }
        return cache[cacheName];
    },
};
expose(exposedMethods);
export type DataLoaderWorker = typeof exposedMethods;
