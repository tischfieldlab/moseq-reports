import app from '@/main';
import store from '@/store/root.store';
import { remote } from 'electron';
import path from 'path';
import { DatasetsState } from '@/store/datasets.types';
import {LoadDefaultLayout} from './LoadLayout';
import StreamZip from 'node-stream-zip';


export const DataFileExt = 'msq';

/**
 * Allows the user to pick a .MSQ file, and then
 * loads that file.
 */
export default function() {
    const filenames = remote.dialog.showOpenDialogSync({
        properties: ['openFile'],
        // defaultPath: process.cwd(),
        filters: [
            { name: 'MoSeq Data Files', extensions: [DataFileExt] },
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
        // .then(async () => await store.dispatch('datasets/Unload'))
        .then(() => readDataBundle(filename))
        .then((data) => store.dispatch('datasets/setData', data))
        .then(() => {
            let init;
            if ((store.state as any).filters.items.length === 0) {
                init = store.dispatch('filters/addFilter');
            } else {
                init = Promise.resolve();
            }
            return init.then(() => Promise.allSettled((store.state as any).filters.items.map((item) => {
                return store.dispatch(`${item}/initialize`);
            })));
        })
        .then(async () => {
            if ((store.state as any).datawindows.items.length === 0) {
                await app.$forceNextTick();
                return LoadDefaultLayout(false);
            }
        })
        .then(() => {
            app.$bvToast.hide('loading-toast');
            app.$root.$emit('finish-dataset-load');
            const message = 'File "' + (store.state as any).datasets.name + '" was loaded successfully.'
            app.$bvToast.toast(message, {
                title: 'Data loaded successfully!',
                variant: 'success',
                toaster: 'b-toaster-bottom-right',
            });
            store.commit('history/addEntry', {message, variant: 'success'});
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
            store.commit('history/addEntry', {message: reason, variant: 'danger'});
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
                    const dataset: DatasetsState = {
                        bundle: filename,
                        name: path.basename(filename, `.${DataFileExt}`),
                        ...await LoadMetadataData(zip),
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

async function LoadMetadataData(zip: StreamZip) {
    return {
        manifest: await jsonParseZipEntry(zip, 'manifest.json'),
        groups: await jsonParseZipEntry(zip, 'groups.json'),
        label_map: await jsonParseZipEntry(zip, 'label_map.json'),
    };
}

async function jsonParseZipEntry(zip: StreamZip, entryName: string) {
    try {
        const entry = zip.entryDataSync(entryName);
        return Promise.resolve(JSON.parse(entry.toString()));
    } catch (e) {
        return Promise.reject(new Error(`Entry ${entryName} is missing from data file!`));
    }
}
