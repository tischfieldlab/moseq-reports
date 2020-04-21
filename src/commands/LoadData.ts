import app from '@/main';
import store from '@/store/root.store';
import { remote } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { deleteFolderRecursive } from '@/util/Files';
import { DatasetsState } from '@/store/datasets.types';
import JSZip from 'jszip';


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
        .then(() => app.$root.$emit('begin-dataset-load'))
        .then(() => readDataBundle(filename))
        .then((data) => store.dispatch('datasets/setData', data))
        .then(() => {
            return Promise.allSettled((store.state as any).filters.items.map((item) => {
                return store.dispatch(`${item}/initialize`);
            }));
        })
        .catch((reason) => {
            app.$root.$emit('fail-dataset-load');
            app.$bvToast.toast(reason, {
                title: 'Error loading data!',
                variant: 'danger',
                toaster: 'b-toaster-bottom-right',
            });
        })
        .then(() => {
            app.$root.$emit('finish-dataset-load');
            app.$bvToast.toast('File "' + (store.state as any).datasets.name + '" was loaded successfully.', {
                title: 'Data loaded successfully!',
                variant: 'success',
                toaster: 'b-toaster-bottom-right',
            });
        })
        .then(async () => {
            if ((store.state as any).datawindows.items.length === 0) {
                await app.$forceNextTick();
                store.dispatch('datawindows/loadDefaultLayout');
            }
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
    return new Promise<DatasetsState>((resolve, reject) => {
        try {
            CleanState(); // clean any old state
            const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'moseq-reports-'));
            const rawData = fs.readFileSync(filename);

            JSZip.loadAsync(rawData).then(async (zip) => {
                const dataset: DatasetsState = {
                    bundle: filename,
                    name: path.basename(filename, '.msq'),
                    path: tmpdir,
                    ...await LoadMetadataData(zip),
                    ...await LoadUsageData(zip),
                    ...await LoadSpinogramData(zip),
                    ...await LoadCrowdMovies(zip, tmpdir),
                };
                resolve(dataset);
            }, (error) => reject(error));
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

async function LoadMetadataData(zip: JSZip) {
    return {
        groups: await jsonParseZipEntry(zip, 'groups.json'),
        label_map: await jsonParseZipEntry(zip, 'label_map.json'),
    };
}

async function LoadSpinogramData(zip: JSZip) {
    // TODO: JSON cannot handle NaN here!
    return {
        spinogram: await jsonParseZipEntryContainingNaN(zip, 'spinogram.corpus-sorted-usage.json'),
    };
}

async function LoadUsageData(zip: JSZip) {
    return {
        usageByUsage: await jsonParseZipEntry(zip, 'usage.ms100.cusage.sTrue.json'),
        usageByFrames: await jsonParseZipEntry(zip, 'usage.ms100.cframes.sTrue.json'),
    };
}

async function LoadCrowdMovies(zip: JSZip, dir: string) {
    const dest = path.join(dir, 'crowd_movies');
    fs.mkdirSync(dest);
    const waiting = new Array<Promise<unknown>>();
    zip.folder('crowd_movies').forEach((relativePath, file) => {
        waiting.push(new Promise((resolve, reject) => {
            file.async('nodebuffer').then((value: Buffer) => {
                try {
                    fs.writeFileSync(path.join(dir, file.name), value);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        }));
    });
    await Promise.allSettled(waiting)
                 .then((values) => {
                    values.forEach((v) => {
                        if (v.status === 'rejected') {
                            throw(v.reason);
                        }
                    });
                 });
    return {};
}


async function jsonParseZipEntry(zip: JSZip, entryName: string) {
    return zip.file(entryName)
                .async('string')
                .then((value) => JSON.parse(value));
}
async function jsonParseZipEntryContainingNaN(zip: JSZip, entryName: string) {
    return zip.file(entryName)
            .async('string')
            .then((data) => {
                return JSON.parse(data.replace(/\bNaN\b/g, '"***NaN***"'), (key, value) => {
                    return value === '***NaN***' ? NaN : value;
                });
            });
}
