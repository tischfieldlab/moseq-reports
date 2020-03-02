import { expose } from 'threads/worker';
import StreamZip from 'node-stream-zip';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {DataLoaderState} from '@/models/DataLoader';



expose({
    async LoadDataBundle(filename: string) {
        // console.log('attempting to open ', filename);
        /*app.$bvToast.toast('Hang tight... We\'re getting your data ready', {
            title: 'Loading Data',
            variant: 'info',
            toaster: 'b-toaster-bottom-right',
        });*/

        const zip = new StreamZip({
            file: filename,
            storeEntries: true,
            skipEntryNameValidation: false,
        });
        return await new Promise((resolve, reject) => {
            zip.on('error', (e) => {
                /*app.$bvToast.toast(err, {
                    title: 'Error loading data!',
                    variant: 'danger',
                    toaster: 'b-toaster-bottom-right',
                });*/
                reject(new Error(e));
            });
            zip.on('ready', () => {
                const currentState = {
                    bundle: filename,
                    name: path.basename(filename, '.msq'),
                    path: fs.mkdtempSync(path.join(os.tmpdir(), 'moseq-reports-')),
                    datasets: {},
                };
                // console.log('Entries read: ' + zip.entriesCount);
                // console.log('zip ready');
                Object.assign(currentState.datasets, LoadMetadataData(zip));
                Object.assign(currentState.datasets, LoadUsageData(zip));
                Object.assign(currentState.datasets, LoadSpinogramData(zip));

                resolve(currentState);

                // store.dispatch('dataview/initialize');
                /*app.$bvToast.toast('File "' + filename + '" was loaded successfully.', {
                    title: 'Data loaded successfully!',
                    variant: 'success',
                    toaster: 'b-toaster-bottom-right',
                });*/
            });
        }).then((currState) => {
            return LoadCrowdMovies(zip, (currState as DataLoaderState).path); // TODO: Keshav
        }).catch((reason) => {
            console.log(reason);
        }).finally(() => {
            zip.close();
        });
    },
});


function LoadMetadataData(zip) {
    return {
        'datasets/SetGroupInfo': jsonParseZipEntry(zip, 'groups.json'),
        'datasets/SetLabelMap': jsonParseZipEntry(zip, 'label_map.json'),
    };
}

function LoadSpinogramData(zip) {
    const data = zip.entryDataSync('spinogram.corpus-sorted-usage.json').toString();
    // TODO: JSON cannot handle NaN here!
    return {'datasets/SetSpinogramData': parseJsonContainingNaN(data)};
}

function LoadUsageData(zip) {
    return {
        'datasets/SetUsageByUsage': jsonParseZipEntry(zip, 'usage.ms100.cusage.sTrue.json'),
        'datasets/SetUsageByFrames': jsonParseZipEntry(zip, 'usage.ms100.cframes.sTrue.json'),
    };
}

function LoadCrowdMovies(zip, dir: string) {
    const dest = path.join(dir, 'crowd_movies');
    fs.mkdirSync(dest);
    return new Promise((resolve, reject) => {
        zip.extract('crowd_movies', dest, (err, count) => {
            // tslint:disable-next-line:no-console
            console.log(err ? 'Extract error' : `Extracted ${count} crowd movie entries`);

            if (err) {
                reject(new Error(err));
            }
            resolve();
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
