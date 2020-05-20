import { expose } from 'threads/worker';
// tslint:disable no-eval
const fs = eval('require(\'fs\')');
import { SortSpec, DataObject, SortDirection } from './DataLoader.types';


const cache = {};

const exposedMethods = {
    async LoadJson(path: string,
                   columns: Array<string|[string, string]>,
                   sorting: SortSpec|undefined,
                   filter: {[key: string]: any[]}|undefined) {


        if (!fs.existsSync(path)) {
            throw new Error(`Path does not exist: "${path}"`);
        }

        const cacheName = JSON.stringify(arguments);

        if (!cache.hasOwnProperty(cacheName)) {
            try {
                // read, parse, and column map
                const pipe = (fs.promises.readFile(path) as Promise<Buffer|string>)
                    .then((buffer) => JSON.parse(buffer.toString()))
                    .then((obj) => mapColumns(obj, columns));

                // sort rows
                if (sorting !== undefined) {
                    pipe.then((obj) => sortBy(obj, sorting.column, sorting.direction));
                }

                // filter rows
                if (filter !== undefined) {
                    pipe.then((obj) => filterBy(obj, filter));
                }

                // stick in cache
                cache[cacheName] = await pipe;
            } catch (e) {
                throw new Error(`Error loading '${path}': ${e}`);
            }
        }
        return cache[cacheName];
    },
};
expose(exposedMethods);
export type DataLoaderWorker = typeof exposedMethods;


function mapColumns(obj: DataObject, columns: Array<string|[string, string]>): object[] {
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
}

function sortBy(data: object[], column: string, direction: SortDirection): object[] {
    // Schwartzian Transform.
    return data.map((e, i) => ({index: i, value: e[column] }))
            .sort((a, b) => (+(a.value > b.value) || +(a.value === b.value) - 1))
            .map((e) => data[e.index]);
}

function filterBy(data: object[], filters: {[key: string]: any[]}) {
    data.filter((row) => Object.entries(filters).every(([col, criterum]) => criterum.includes(row[col])));
}

