// import StreamZip from 'node-stream-zip';
import DataModel, { MetadataJson } from './DataModel';
import fs from 'fs';
import path from 'path';
import os from 'os';
import store from '@/store/root.store';
import StreamZip from 'node-stream-zip';

import app from '@/main';

interface DataLoaderState {
    bundle: string; // path to the bundle
    path: string; // path to uncompressed data
}

let currentState: DataLoaderState|undefined;


export default function LoadDataBundle(filename: string) {
    // console.log('attempting to open ', filename);
    const zip = new StreamZip({
        file: filename,
        storeEntries: true,
        skipEntryNameValidation: false,
    });
    zip.on('error', (err) => {
        throw new Error(err);
    });
    zip.on('ready', () => {
        currentState = {
            bundle: filename,
            path: fs.mkdtempSync(path.join(os.tmpdir(), 'moseq-reports-')),
        };
        // console.log('Entries read: ' + zip.entriesCount);
        // console.log('zip ready');
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

function LoadSpinogramData(zip) {
    if (currentState === undefined) {
        throw new Error('unexpected current state is undefined!');
    }
    const data = zip.entryDataSync('spinogram.corpus-sorted-usage.json').toString();
    // TODO: JSON cannot handle NaN here!
    store.commit('datasets/SetSpinogramData', parseJsonContainingNaN(data));
}

function LoadUsageData(zip) {
    const data = zip.entryDataSync('metadata.json');
    const content: MetadataJson = JSON.parse(data) as MetadataJson;
    DataModel.loadMetadataFile(content);
    //store.commit('datasets/SetUsageByUsage', content);
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



function parseJsonContainingNaN(data) {
    return JSON.parse(data.replace(/\bNaN\b/g, '"***NaN***"'), (key, value) => {
        return value === '***NaN***' ? NaN : value;
    });
}
