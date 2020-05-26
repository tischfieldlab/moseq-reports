import {
    DataObject,
    SortDirection,
    SortOperation,
    FilterOperation,
    MapOperation,
    AggregateOperation,
    PluckOperation,
} from './DataLoader.types';
import { groupby } from '@/util/Array';
import { unnest } from '@/util/Vuex';
import { mean, median, sum, min, max } from 'd3-array';
import StreamZip from 'node-stream-zip';
import fs from 'fs';

export function mapColumns(obj: DataObject|object[], op: MapOperation): object[] {
    let objCols;
    if (Array.isArray(obj)) {
        objCols = Object.getOwnPropertyNames(obj[0]);
    } else if (obj.columns !== undefined && obj.data !== undefined) {
        objCols = obj.columns;
    }

    const mapCols = op.columns || objCols;

    const coldefs = mapCols.map((c) => {
        if (typeof c === 'string' || c instanceof String) {
            return {
                src: c as string,
                dest: c as string,
                idx: objCols.indexOf(c as string),
            };
        } else {
            return {
                src: c[0] as string,
                dest: c[1] as string,
                idx: objCols.indexOf(c[0]),
            };
        }
    });

    const mapData = Array.isArray(obj) ? obj : obj.data;
    return (mapData as any[][]).map((row) => {
        return Object.fromEntries(
            coldefs.map((cd) => {
                return [cd.dest, Array.isArray(row) ? row[cd.idx] : row[cd.src]];
            }),
        );
    });
}

export function sortBy(data: object[], op: SortOperation): object[] {
    // Schwartzian Transform.
    if (op.direction === SortDirection.Asc) {
        return data.map((e, i) => ({index: i, value: e[op.column] }))
            .sort((a, b) => (+(a.value > b.value) || +(a.value === b.value) - 1))
            .map((e) => data[e.index]);
    } else if (op.direction === SortDirection.Desc) {
        return data.map((e, i) => ({index: i, value: e[op.column] }))
            .sort((b, a) => (+(a.value > b.value) || +(a.value === b.value) - 1))
            .map((e) => data[e.index]);
    } else {
        throw new Error(`Unsupported direction in sort '${op.direction}'`);
    }
}

export function filterBy(data: object[], op: FilterOperation) {
    return data.filter((row) => Object.entries(op.filters)
                               .every(([col, criterum]) => criterum.includes(row[col])));
}

const statops = {
    mean,
    median,
    sum,
    min,
    max,
};
export function aggregate(data: object[], op: AggregateOperation) {
    const grouper = (item) => (op.groupby as string[]).map((c) => item[c]).toString();
    return Object.entries(groupby(data, grouper))
        .map(([group, vals]) => {
            return Object.fromEntries([
                ...op.groupby.map((g) => [g, vals[0][g]]),
                ...Object.entries(op.aggregate)
                    .flatMap(([col, stats]) => {
                        if (Array.isArray(stats)) {
                            return stats.map((stat) => {
                                return [`${col}_${stat}`, (statops[stat] as any)(vals.map((v) => v[col]))];
                            });
                        } else {
                            return [[col, (statops[stats] as any)(vals.map((v) => v[col]))]];
                        }
                    }),
            ]);
        });
}

export function pluck(data: object|object[], op: PluckOperation) {
    if (Array.isArray(data)) {
        return data.map((row) => unnest(row, op.column));
    } else {
        return unnest(data, op.column);
    }
}

export function jsonParseZipEntryContainingNaN(data: string) {
    return JSON.parse(data.replace(/\bNaN\b/g, '"***NaN***"'), (key, value) => {
        return value === '***NaN***' ? NaN : value;
    });
}

export function readFileContents(path: string) {
    const match = path.match(/(.*\.msq)(.*)/);
    if (match) {
        // entry name should not have leading slash
        const entryname = match[2].replace(/^[\\\/]+/, '').replace(/\\/, '/');
        return new Promise<Buffer>((resolve, reject) => {
            const zip = new StreamZip({
                file: match[1],
                storeEntries: true,
            });
            zip.on('error', (err) => {
                zip.close();
                reject(err);
            });
            zip.on('ready', async () => {
                /*for (const entry of Object.values(zip.entries())) {
                    const desc = entry.isDirectory ? 'directory' : `${entry.size} bytes`;
                    console.log(`Entry ${entry.name}: ${desc}`);
                }*/
                try {
                    const entry = zip.entryDataSync(entryname);
                    if (entry !== null) {
                        zip.close();
                        resolve(entry);
                    } else {
                        throw new Error(`Entry ${entryname} is missing from data file!`);
                    }
                } catch (e) {
                    reject(e);
                } finally {
                    zip.close();
                }
            });
        });
    } else {
        return fs.promises.readFile(path);
    }
}
