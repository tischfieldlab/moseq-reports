// import StreamZip from 'node-stream-zip';
import DataModel, { MetadataJson } from './DataModel';
const fs = require('fs');
const path = require('path');
const os = require('os');

interface DataLoaderState {
    bundle: string, // path to the bundle
    path: string, // path to uncompressed data
    datasets: Map<string, any>,
}

let currentState : DataLoaderState|undefined = undefined;


export default function LoadDataBundle(filename: string) {
    // console.log('attempting to open ', filename);
    const StreamZip = require('node-stream-zip');
    const zip = new StreamZip({
        file: filename,
        storeEntries: true,
        skipEntryNameValidation: false,
    });
    zip.on('error', (err) => {
        // tslint:disable-next-line:no-console
        console.log('zip error', err);
    });
    zip.on('ready', () => {
        currentState = {
            bundle: filename,
            path: fs.mkdtempSync(path.join(os.tmpdir(), 'moseq-reports-')),
            datasets: new Map<string, any>(),
        }
        // console.log('Entries read: ' + zip.entriesCount);
        // console.log('zip ready');
        LoadUsageData(zip);


        //LoadCrowdMovies(zip); //for future use

        zip.close();
    });
}

function LoadSpinogramData(zip) {
    if (currentState === undefined) {
        throw new Error('unexpected current state is undefined!');
    }
    const data = zip.entryDataSync('spinogram.corpus-sorted-usage.json');
    currentState.datasets.set('spinogram', data);
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
