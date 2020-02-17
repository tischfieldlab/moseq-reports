// import StreamZip from 'node-stream-zip';
import DataModel, { MetadataJson } from './DataModel';
import fs from 'fs';
import path from 'path';
import os from 'os';
import store from '@/store/root.store';
import StreamZip from 'node-stream-zip';
import DataFrame from 'dataframe-js';


import app from '@/main';

interface DataLoaderState {
    bundle: string; // path to the bundle
    path: string; // path to uncompressed data
}

let currentState: DataLoaderState|undefined;


export default function LoadDataBundle(filename: string) {
    // console.log('attempting to open ', filename);
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
    zip.on('ready', () => {
        currentState = {
            bundle: filename,
            path: fs.mkdtempSync(path.join(os.tmpdir(), 'moseq-reports-')),
        };
        // console.log('Entries read: ' + zip.entriesCount);
        // console.log('zip ready');
        LoadMetadataData(zip);
        LoadUsageData(zip);
        LoadSpinogramData(zip);
        // LoadCrowdMovies(zip); //for future use

        zip.close();
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
    fs.rmdirSync(currentState.path, {recursive: true});
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
    const data1Df = new DataFrame(data1.data, data1.columns);
    store.commit('datasets/SetUsageByUsage', data1Df);

    const data2 = jsonParseZipEntry(zip, 'usage.ms100.cframes.sTrue.json');
    const data2Df = new DataFrame(data2.data, data2.columns);
    store.commit('datasets/SetUsageByFrames', data2Df);

    // DataModel.loadMetadataFile(data1);
}

function LoadCrowdMovies(zip) {
    if (currentState === undefined) {
        throw new Error('unexpected current state is undefined!');
    }
    const dest = path.join(currentState.path, 'crowd_movies');
    fs.mkdirSync(dest);
    zip.extract('crowd_movies', dest, (err, count) => {
        // tslint:disable-next-line:no-console
        console.log(err ? 'Extract error' : `Extracted ${count} entries`);
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