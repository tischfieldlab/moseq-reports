import {
    DataObject,
    SortDirection,
    SortOperation,
    FilterOperation,
    MapOperation,
    AggregateOperation,
    PluckOperation,
    KeysOperation,
} from './DataLoader.types';
import { groupby } from '@/util/Array';
import { mean, median, sum, min, max } from 'd3-array';
import { tsvParse, csvParse } from 'd3-dsv';
import StreamZip from 'node-stream-zip';
import fs from 'fs';

export function mapColumns(obj: DataObject|Array<object>, op: MapOperation): Array<object> {
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
    return (mapData as Array<Array<any>>).map((row) => {
        return Object.fromEntries(
            coldefs.map((cd) => {
                return [cd.dest, Array.isArray(row) ? row[cd.idx] : row[cd.src]];
            }),
        );
    });
}

export function sortBy(data: Array<object>, op: SortOperation): Array<object> {
    // Schwartzian Transform.
    if (op.direction === SortDirection.Asc) {
        return data.map((e, i) => ({index: i, value: e}))
            .sort((a, b) => {
                for (const c of op.columns) {
                    if (a.value[c] > b.value[c]) { return 1; }
                    if (a.value[c] < b.value[c]) { return -1; }
                }
                return 0;
            })
            .map((e) => data[e.index]);
    } else if (op.direction === SortDirection.Desc) {
        return data.map((e, i) => ({index: i, value: e}))
            .sort((a, b) => {
                for (const c of op.columns) {
                    if (a.value[c] < b.value[c]) { return 1; }
                    if (a.value[c] > b.value[c]) { return -1; }
                }
                return 0;
            })
            .map((e) => data[e.index]);
    } else {
        throw new Error(`Unsupported direction in sort '${op.direction}'`);
    }
}

export function filterBy(data: Array<object>, op: FilterOperation) {
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
export function aggregate(data: Array<object>, op: AggregateOperation) {
    const grouper = (item) => (op.groupby as Array<string>).map((c) => item[c]).toString();
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

export function pluck(data: object|Array<object>, op: PluckOperation) {
    if (Array.isArray(data)) {
        if (Array.isArray(op.column)) {
            return data.map((row) => {
                return Object.fromEntries((op.column as Array<string>).map((c) => {
                    return [c, row[c]];
                }));
            });
        } else {
            return data.map((row) => row[op.column as string]);
        }
    } else {
        if (Array.isArray(op.column)) {
            return Object.fromEntries(op.column.map((c) => {
                return [c, data[c]];
            }));
        } else {
            return data[op.column];
        }
    }
}

export function keys(data: object, op: KeysOperation) {
    return Object.keys(data);
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
                reject(`${err}: ${entryname}`);
            });
            zip.on('ready', async () => {
                try {
                    const entry = zip.entryDataSync(entryname);
                    if (entry !== null) {
                        zip.close();
                        resolve(entry);
                    } else {
                        throw new Error(`Entry ${entryname} is missing from data file!`);
                    }
                } catch (e) {
                    reject(`${e}: ${entryname}`);
                } finally {
                    zip.close();
                }
            });
        });
    } else {
        return fs.promises.readFile(path);
    }
}

export function getParser(filename) {
    const ext = filename.split('.').pop();
    switch (ext) {
        case 'json':
            return jsonParseZipEntryContainingNaN;
        case 'tsv':
            return (data) => tsvParse(data, autoType);
        case 'csv':
            return (data) => csvParse(data, autoType);
        default:
            return (data) => data;
    }
}


/* This should be imported from d3-dsv, but isnt present in types! */
function autoType(object) {
    const pattern = /^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/;
    for (const key of Object.keys(object)) {
        let value = object[key].trim();
        let num;
        let m;
        if (!value) {
            value = null;
        } else if (value === 'true') {
            value = true;
        } else if (value === 'false') {
            value = false;
        } else if (value === 'NaN') {
            value = NaN;
        } else if (!isNaN(num = +value)) {
            value = num;
        } else if (value.match(pattern)) {
            m = value.match(pattern);
            if (fixtz && !!m[4] && !m[7]) {
                value = value.replace(/-/g, '/').replace(/T/, ' ');
            }
            value = new Date(value);
        } else {
            continue;
        }
        object[key] = value;
    }
    return object;
}
// https://github.com/d3/d3-dsv/issues/45
const fixtz = new Date('2019-01-01T00:00').getHours() || new Date('2019-07-01T00:00').getHours();
