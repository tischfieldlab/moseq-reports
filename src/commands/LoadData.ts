import app from '@/main';
import store from '@/store/root.store';
import { remote } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import StreamZip from 'node-stream-zip';
import { deleteFolderRecursive } from '@/util/Files';


/**
 * Allows the user to pick a .MSQ file, and then
 * loads that file.
 */
export default function() {
    const filenames = remote.dialog.showOpenDialogSync({
        properties: ['openFile'],
        defaultPath: process.cwd(),
    });
    if (filenames === undefined) {
        return;
    }

    LoadDataFile(filenames[0]);
}

export function LoadDataFile(filename: string) {
    // Once the toast that we are loading data is actually shown,
    // then actualy go ahead and load the data. Otherwise the toast
    // animation and loading will race and frequently the loading
    // notification will fail to show until after data is loaded.
    app.$root.$once('bv::toast:shown', () => beginLoadingProcess(filename));
    showStartLoadingToast();
}

function beginLoadingProcess(filename: string) {
    app.$forceNextTick()
        .then(() => readDataBundle(filename))
        .catch((reason) => {
            app.$bvToast.toast(reason, {
                title: 'Error loading data!',
                variant: 'danger',
                toaster: 'b-toaster-bottom-right',
            });
        }).then(() => {
            app.$bvToast.toast('File "' + (store.state as any).datasets.name + '" was loaded successfully.', {
                title: 'Data loaded successfully!',
                variant: 'success',
                toaster: 'b-toaster-bottom-right',
            });
        });
}

function showStartLoadingToast() {
    const h = app.$createElement;

    const body = [
        h('div', {}, [
            h('b-spinner', {
                props: { type: 'grow', small: true },
                style: { 'margin-right': '1em' },
            }),
            'Hang tight... We\'re getting your data ready.',
        ]),
    ];

    app.$bvToast.toast(body, {
        title: 'Loading Data',
        variant: 'info',
        toaster: 'b-toaster-bottom-right',
        // noAutoHide: true,
    });
}

function readDataBundle(filename: string) {
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
