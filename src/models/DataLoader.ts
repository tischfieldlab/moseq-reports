import fs from 'fs';
import path from 'path';
import os from 'os';
import store from '@/store/root.store';
import StreamZip from 'node-stream-zip';
import ElectronStore from 'electron-store';


import app from '@/main';
import { deleteFolderRecursive } from '@/util/Files';

interface DataLoaderState {
    bundle: string; // path to the bundle
    name: string; // basename of the bundle
    path: string; // path to uncompressed data
}

let currentState: DataLoaderState|undefined;


export default function LoadDataBundle(filename: string) {
    // console.log('attempting to open ', filename);
    app.$bvToast.toast('Hang tight... We\'re getting your data ready', {
        title: 'Loading Data',
        variant: 'info',
        toaster: 'b-toaster-bottom-right',
    });
    CleanState(); // clean any old state

    const zip = new StreamZip({
        file: filename,
        storeEntries: true,
        skipEntryNameValidation: false,
    });
    zip.on('error', (err) => {
        app.$bvToast.toast(err, {
            title: 'Error loading data!',
            variant: 'danger',
            toaster: 'b-toaster-bottom-right',
        });
        throw new Error(err);
    });
    zip.on('extract', (entry, file) => {
        // tslint:disable-next-line:no-console
        // console.log(`Extracted ${entry.name} to ${file}`);
    });
    zip.on('ready', () => {
        currentState = {
            bundle: filename,
            name: path.basename(filename, '.msq'),
            path: fs.mkdtempSync(path.join(os.tmpdir(), 'moseq-reports-')),
        };
        /*console.log('Entries read: ' + zip.entriesCount);
        for (const entry of Object.values(zip.entries())) {
            const desc = (entry as any).isDirectory ? 'directory' : `${(entry as any).size} bytes`;
            console.log(`Entry ${(entry as any).name}: ${desc}`);
        }*/
        // console.log('Entries read: ' + zip.entriesCount);
        // console.log('zip ready');
        LoadMetadataData(zip);
        LoadUsageData(zip);
        LoadSpinogramData(zip);
        LoadCrowdMovies(zip); // TODO: Keshav

        // zip.close();
        store.commit('datasets/SetDataInfo', {name: currentState.name, path: currentState.path});
        store.dispatch('dataview/initialize');
        app.$bvToast.toast('File "' + filename + '" was loaded successfully.', {
            title: 'Data loaded successfully!',
            variant: 'success',
            toaster: 'b-toaster-bottom-right',
        });
    });
}

function CleanState() {
    if (currentState === undefined) {
        return;
    }
    deleteFolderRecursive(currentState.path);
}
function EnsureState() {
    if (currentState === undefined) {
        throw new Error('unexpected current state is undefined!');
    }
}

function LoadMetadataData(zip) {
    EnsureState();
    store.commit('datasets/SetGroupInfo', jsonParseZipEntry(zip, 'groups.json'));
    store.commit('datasets/SetLabelMap', jsonParseZipEntry(zip, 'label_map.json'));
}

function LoadSpinogramData(zip) {
    EnsureState();
    const data = zip.entryDataSync('spinogram.corpus-sorted-usage.json').toString();
    // TODO: JSON cannot handle NaN here!
    store.commit('datasets/SetSpinogramData', parseJsonContainingNaN(data));
}

function LoadUsageData(zip) {
    EnsureState();
    const data1 = jsonParseZipEntry(zip, 'usage.ms100.cusage.sTrue.json');
    store.commit('datasets/SetUsageByUsage', data1);

    const data2 = jsonParseZipEntry(zip, 'usage.ms100.cframes.sTrue.json');
    store.commit('datasets/SetUsageByFrames', data2);
}

function LoadCrowdMovies(zip) {
    if (currentState === undefined) {
        throw new Error('unexpected current state is undefined!');
    }
    const dest = path.join(currentState.path, 'crowd_movies');
    fs.mkdirSync(dest);
    zip.extract('crowd_movies', dest, (err, count) => {
        // tslint:disable-next-line:no-console
        console.log(err ? `Extract error: ${err}` : `Extracted ${count} crowd movie entries`);
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
