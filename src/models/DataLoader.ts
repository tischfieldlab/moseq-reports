import fs from 'fs';
import path from 'path';
import os from 'os';
import store from '@/store/root.store';
import StreamZip from 'node-stream-zip';
import { deleteFolderRecursive } from '@/util/Files';



export default function LoadDataBundle(filename: string) {
    return new Promise((resolve, reject) => {
        CleanState(); // clean any old state
        const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'moseq-reports-'));

        const zip = new StreamZip({
            file: filename,
            storeEntries: true,
            skipEntryNameValidation: false,
        });

        zip.on('error', (err) => {
            reject(new Error(err));
        });

        zip.on('ready', async () => {
            const data = {
                bundle: filename,
                name: path.basename(filename, '.msq'),
                path: tmpdir,
                ...LoadMetadataData(zip),
                ...LoadUsageData(zip),
                ...LoadSpinogramData(zip),
                ...await LoadCrowdMovies(zip, tmpdir),
            };
            await store.dispatch('datasets/setData', data);
            zip.close();
            Promise.allSettled((store.state as any).filters.items.map((item) => {
                store.dispatch(`${item}/initialize`);
            }));
            resolve();
        });
    });
}

function CleanState() {
    const datapath = (store.state as any).datasets.path;
    if (datapath === undefined) {
        return;
    }
    deleteFolderRecursive(datapath);
}

function LoadMetadataData(zip) {
    return {
        groups: jsonParseZipEntry(zip, 'groups.json'),
        label_map: jsonParseZipEntry(zip, 'label_map.json'),
    };
}

function LoadSpinogramData(zip) {
    const data = zip.entryDataSync('spinogram.corpus-sorted-usage.json').toString();
    // TODO: JSON cannot handle NaN here!
    return {
        spinogram: parseJsonContainingNaN(data),
    };
}

function LoadUsageData(zip) {
    return {
        usageByUsage: jsonParseZipEntry(zip, 'usage.ms100.cusage.sTrue.json'),
        usageByFrames: jsonParseZipEntry(zip, 'usage.ms100.cframes.sTrue.json'),
    };
}

function LoadCrowdMovies(zip, dir): Promise<object> {
    return new Promise((resolve, reject) => {
        const dest = path.join(dir, 'crowd_movies');
        fs.mkdirSync(dest);
        zip.extract('crowd_movies', dest, (err, count) => {
            // tslint:disable-next-line:no-console
            console.log(err ? 'Extract error' : `Extracted ${count} crowd movie entries`);
            if (err) {
                reject(err);
            } else {
                resolve({});
            }
        });
    });
}


function jsonParseZipEntry(zip, entryName) {
    const data = zip.entryDataSync(entryName);
    return JSON.parse(data);
}
function parseJsonContainingNaN(data) {
    return JSON.parse(data.replace(/\bNaN\b/g, '"***NaN***"'), (key, value) => {
        return value === '***NaN***' ? NaN : value;
    });
}



import http from 'http';

http.createServer((request, response) => {
    request.addListener('end', () => {
        if (currentState === undefined || request.url === undefined) {
            response.writeHead(404).end('No data loaded.');
            return;
        } else {
            const fpath = path.join(currentState.path, decodeURI(request.url));
            fs.readFile(fpath, (err, data) => {
                if (err) {
                    response.writeHead(404).end(JSON.stringify(err));
                    return;
                }
                response.writeHead(200).end(data);
            });
        }
    }).resume();
}).listen(8989);
