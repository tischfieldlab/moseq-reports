import app from '@/main';
import store from '@/store/root.store';
import { remote } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { deleteFolderRecursive } from '@/util/Files';
import { DatasetsState } from '@/store/datasets.types';
import {LoadDefaultLayout} from './LoadLayout';
import StreamZip from 'node-stream-zip';


/**
 * Allows the user to pick a .MSQ file, and then
 * loads that file.
 */
export default function() {
    const filenames = remote.dialog.showOpenDialogSync({
        properties: ['openFile'],
        defaultPath: process.cwd(),
        filters: [
            { name: 'MoSeq Data Files', extensions: ['msq'] },
            { name: 'All Files', extensions: ['*'] },
        ],
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
        .then(() => app.$root.$emit('begin-dataset-load'))
        .then(() => readDataBundle(filename))
        .then((data) => store.dispatch('datasets/setData', data))
        .then(() => {
            return Promise.allSettled((store.state as any).filters.items.map((item) => {
                return store.dispatch(`${item}/initialize`);
            }));
        })
        .then(async () => {
            if ((store.state as any).datawindows.items.length === 0) {
                await app.$forceNextTick();
                return LoadDefaultLayout();
            }
        })
        .then(() => {
            app.$bvToast.hide('loading-toast');
            app.$root.$emit('finish-dataset-load');
            app.$bvToast.toast('File "' + (store.state as any).datasets.name + '" was loaded successfully.', {
                title: 'Data loaded successfully!',
                variant: 'success',
                toaster: 'b-toaster-bottom-right',
            });
        })
        .catch((reason) => {
            app.$bvToast.hide('loading-toast');
            /* tslint:disable-next-line:no-console */
            console.error(reason);
            app.$root.$emit('fail-dataset-load');
            app.$bvToast.toast(reason.toString(), {
                title: 'Error loading data!',
                variant: 'danger',
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
        id: 'loading-toast',
        title: 'Loading Data',
        variant: 'info',
        toaster: 'b-toaster-bottom-right',
        // noAutoHide: true,
    });
}

function readDataBundle(filename: string) {
    return new Promise<DatasetsState>((resolve, reject) => {
        let zip;
        try {
            CleanState(); // clean any old state
            const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'moseq-reports-'));

            zip = new StreamZip({
                file: filename,
                storeEntries: true,
            });
            zip.on('error', (err) => {
                zip.close();
                reject(err);
            });
            zip.on('ready', async () => {
                try {
                    // await ExtractDirectory(zip, null, tmpdir);
                    const dataset: DatasetsState = {
                        bundle: filename,
                        name: path.basename(filename, '.msq'),
                        path: tmpdir,
                        ...await LoadManifest(zip),
                        ...await LoadMetadataData(zip),
                        // ...await LoadUsageData(zip),
                        // ...await LoadSpinogramData(zip),
                        // ...await LoadCrowdMovies(zip, tmpdir),
                        // ...await LoadScalarsData(zip, tmpdir),
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

function CleanState() {
    const datapath = (store.state as any).datasets.path;
    if (datapath === undefined) {
        return;
    }
    deleteFolderRecursive(datapath);
}
async function LoadManifest(zip: StreamZip) {
    return {
        manifest: await jsonParseZipEntry(zip, 'manifest.json'),
    };
}
async function LoadMetadataData(zip: StreamZip) {
    return {
        groups: await jsonParseZipEntry(zip, 'groups.json'),
        label_map: await jsonParseZipEntry(zip, 'label_map.json'),
    };
}

async function LoadSpinogramData(zip: StreamZip) {
    // TODO: JSON cannot handle NaN here!
    return {
        spinogram: await jsonParseZipEntryContainingNaN(zip, 'spinogram.corpus-sorted-usage.json'),
    };
}

async function LoadUsageData(zip: StreamZip) {
    return {
        usageByUsage: await jsonParseZipEntry(zip, 'usage.ms100.cusage.sTrue.json'),
        usageByFrames: await jsonParseZipEntry(zip, 'usage.ms100.cframes.sTrue.json'),
    };
}

async function LoadCrowdMovies(zip: StreamZip, dir: string) {
    return {}; // ExtractDirectory(zip, 'crowd_movies', dir);
}

async function LoadScalarsData(zip: StreamZip, dir: string) {
    return {}; // ExtractDirectory(zip, 'scalars', dir);
}

async function ExtractDirectory(zip: StreamZip, dirname: string|null, basedest: string): Promise<object> {
    let dest: string;
    if (dirname !== null) {
        dest = path.join(basedest, dirname);
        fs.mkdirSync(dest);
    } else {
        dest = basedest;
    }
    return new Promise((resolve, reject) => {
        zip.extract(dirname as string, dest, (err) => {
            if (err !== null) {
                reject(err);
            }
            resolve({});
        });
    });
}


async function jsonParseZipEntry(zip: StreamZip, entryName: string) {
    const entry = zip.entryDataSync(entryName);
    if (entry !== null) {
        return Promise.resolve(JSON.parse(entry.toString()));
    }
    return Promise.reject(new Error(`Entry ${entryName} is missing from data file!`));
}
async function jsonParseZipEntryContainingNaN(zip: StreamZip, entryName: string) {
    const entry = zip.entryDataSync(entryName);
    if (entry !== null) {
        return Promise.resolve(JSON.parse(entry.toString().replace(/\bNaN\b/g, '"***NaN***"'), (key, value) => {
                    return value === '***NaN***' ? NaN : value;
                }));
    }
    return Promise.reject(new Error(`Entry ${entryName} is missing from data file!`));
}
