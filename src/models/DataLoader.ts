// import StreamZip from 'node-stream-zip';
import DataModel, { MetadataJson } from './DataModel';
import fs from 'fs';
import path from 'path';
import os from 'os';
import store from '@/store/root.store';

interface DataLoaderState {
    bundle: string; // path to the bundle
    path: string; // path to uncompressed data
    datasets: Map<string, any>;
}

let currentState: DataLoaderState|undefined;


export default function LoadDataBundle(filename: string) {
    // console.log('attempting to open ', filename);
    const StreamZip = require('node-stream-zip');
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
            datasets: new Map<string, any>(),
        };
        // console.log('Entries read: ' + zip.entriesCount);
        // console.log('zip ready');
        LoadUsageData(zip);
        LoadSpinogramData(zip);


        // LoadCrowdMovies(zip); //for future use

        zip.close();
    });
}

function LoadSpinogramData(zip) {
    if (currentState === undefined) {
        throw new Error('unexpected current state is undefined!');
    }
    const data = zip.entryDataSync('spinogram.corpus-sorted-usage.json').toString();
    // tslint:disable-next-line:no-eval
    // TODO: JSON cannot handle NaN here!
    store.commit('datasets/SetSpinogramData', parseJsonContainingNaN(data));
    // console.log(eval(data))
    // console.log(store);
    // (store.state as any).datasets.spinogram = data;
    // currentState.datasets.set('spinogram', data);
}

function LoadUsageData(zip) {
    const data = zip.entryDataSync('metadata.json');
    const content: MetadataJson = JSON.parse(data) as MetadataJson;
    DataModel.loadMetadataFile(content);
}

function LoadCrowdMovies(zip) {
    if (currentState === undefined) {
        throw new Error('unexpected current state is undefined!');
    }
    const dest = path.join(currentState.path, 'crowd_movies');
    fs.mkdirSync(dest);
    zip.extract('crowd_movies', dest, (err, count) => {
        console.log(err ? 'Extract error' : `Extracted ${count} entries`);
    });
}



function parseJsonContainingNaN(data) {
    return JSON.parse(data.replace(/\bNaN\b/g, '"***NaN***"'), (key, value) => {
        return value === '***NaN***' ? NaN : value;
    });
}
