import {
    DataObject,
    SortDirection,
    SortOperation,
    FilterOperation,
    MapOperation,
    AggregateOperation,
    PluckOperation,
    KeysOperation,
    ValuesOperation,
} from "./DataLoader.types";
import { groupby } from "../../electron/shared/Events";
import { mean, median, sum, min, max, extent, variance, deviation } from "d3-array";
import { tsvParse, csvParse } from "d3-dsv";
import StreamZip from "node-stream-zip";
import fs from "fs";
import path, { resolve } from "path";
import {JsonDecoderWithNaNSupport} from "./JsonDecoder";
import { autoType } from "./util";


export function readDataBundle(filename: string): Promise<any> {
    const normalizedFilename = path.normalize(filename);
    return new Promise((resolve, reject) => {
        let zip;
        try {
            zip = new StreamZip({ file: normalizedFilename, storeEntries: true });
            zip.on('error', reject);
            zip.on('ready', async () => {
                try {
                    const dataset = {
                        bundle: filename,
                        name: path.basename(filename, `.msq`),
                        ...await LoadMetadataData(zip),
                    };
                    resolve(dataset);
                } catch (e) {
                    reject(e);
                } finally {
                    zip.close();
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}

async function LoadMetadataData(zip: StreamZip) {
    return {
        manifest: await jsonParseZipEntry(zip, 'manifest.json'),
        groups: await jsonParseZipEntry(zip, 'groups.json'),
        label_map: await jsonParseZipEntry(zip, 'label_map.json'),
    };
}

async function jsonParseZipEntry(zip: StreamZip, entryName: string) {
    try {
        const entry = zip.entryDataSync(entryName);
        return JSON.parse(entry.toString());
    } catch {
        throw new Error(`Entry ${entryName} is missing from data file!`);
    }
}

export function mapColumns(obj: DataObject | object[], op: MapOperation): object[] {
    let objCols;
    if (Array.isArray(obj)) {
        if (obj.length > 0) {
            objCols = Object.getOwnPropertyNames(obj[0]);
        } else {
            objCols = [];
        }
    } else if (obj.columns !== undefined && obj.data !== undefined) {
        objCols = obj.columns;
    }

    const mapCols = op.columns || objCols;

    const coldefs = mapCols.map((c) => {
        if (typeof c === "string" || c instanceof String) {
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
            })
        );
    });
}

function Compare(a: SchwartzianItem, b: SchwartzianItem, column: string, direction: SortDirection) {
    if (direction === SortDirection.Asc) {
        if (a.value[column] > b.value[column]) return 1;
        if (a.value[column] < b.value[column]) return -1;
        return 0;
    } else if (direction === SortDirection.Desc) {
        if (a.value[column] < b.value[column]) return 1;
        if (a.value[column] > b.value[column]) return -1;
        return 0;
    } else {
        throw new Error(`Unsupported direction '${direction}' in sort for column '${column}'`);
    }
}

interface SchwartzianItem {
    index: number;
    value: object;
}

export function sortBy(data: object[], op: SortOperation): object[] {
    // Schwartzian Transform.
    return data
        .map((e, i) => ({ index: i, value: e }))
        .sort((a, b) => {
            for (const c of op.columns) {
                const result = Compare(a, b, c[0], c[1]);
                if (result !== 0) {
                    return result;
                }
            }
            return 0;
        })
        .map((e) => data[e.index]);
}

export function filterBy(data: object[], op: FilterOperation) {
    return data.filter((row) => Object.entries(op.filters)
        .every(([col, criterum]) => criterum.includes(row[col])));
}

const statops = {
    mean,
    median,
    // mode,
    sum,
    // cumsum,
    min,
    max,
    extent,
    variance,
    deviation,
    count: (items: any[]) => items.length,
};
export function aggregate(data: object[], op: AggregateOperation) {
    const grouper = (item) => (op.groupby as string[]).map((c) => item[c]).toString();
    return Object.entries(groupby(data, grouper)).map(([group, vals]) => {
        return Object.fromEntries([
            ...op.groupby.map((g) => [g, vals[0][g]]),
            ...Object.entries(op.aggregate).flatMap(([col, stats]) => {
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

export function pluck(data: object | object[], op: PluckOperation) {
    if (Array.isArray(data)) {
        return data.map((row) => row[op.column as string]);
    } else {
        return data[op.column];
    }
}

export function keys(data: object, op: KeysOperation) {
    return Object.keys(data);
}
export function values(data: object, op: ValuesOperation) {
    return Object.values(data);
}

export function jsonParseZipEntryContainingNaN(data: string) {
    return JSON.parse(data.replace(/\bNaN\b/g, '"***NaN***"'), (key, value) => {
        return value === "***NaN***" ? NaN : value;
    });
}

export function jsonParseBuffer(data: Buffer) {
    const decoder = new JsonDecoderWithNaNSupport();
    return decoder.read(data) as any;
}

export function fileExists(path: string): Promise<boolean> {
    const match = path.match(/(.*\.msq)(.*)/);
    if (match) {
        const entryname = match[2].replace(/^[\\\/]+/, "").replace(/\\/, "/");
        return new Promise<boolean>((resolve, reject) => {
            const zip = new StreamZip({
                file: match[1],
                storeEntries: true,
            });
            zip.on("error", (err) => {
                zip.close();
                resolve(false);
            });
            zip.on("ready", async () => {
                const entries = zip.entries();
                for (const entry of Object.values(entries)) {
                    if (entry.name === entryname) {
                        resolve(true);
                    }
                }
                resolve(false);
                zip.close();
            });
        });
    } else {
        return Promise.resolve(fs.existsSync(path));
    }
}

export function readFileContents(path: string) {
    const match = path.match(/(.*\.msq)(.*)/);
    if (match) {
        const entryname = match[2].replace(/^[\\\/]+/, "").replace(/\\/, "/");
        return new Promise<Buffer>((resolve, reject) => {
            const zip = new StreamZip({
                file: match[1],
                storeEntries: true,
            });
            zip.on("error", (err) => {
                zip.close();
                reject(`${err}: ${entryname}`);
            });
            zip.on("ready", async () => {
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

export function getParser(filename): (data: Buffer) => any {
    const ext = filename.split(".").pop();
    switch (ext) {
        case "json":
            return jsonParseBuffer;
        case "tsv":
            return (data) => tsvParse(data.toString(), autoType);
        case "csv":
            return (data) => csvParse(data.toString(), autoType);
        default:
            return (data) => data;
    }
}
