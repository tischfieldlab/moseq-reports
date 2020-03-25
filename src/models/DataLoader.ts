import fs from 'fs';
import path from 'path';
import os from 'os';
import store from '@/store/root.store';
import StreamZip from 'node-stream-zip';
import ElectronStore from 'electron-store';


import app from '@/main';
import { deleteFolderRecursive } from '@/util/Files';



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
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'moseq-reports-'));
    zip.on('ready', async () => {
        const data = {
            bundle: filename,
            name: path.basename(filename, '.msq'),
            path: tmpdir,
            ...LoadMetadataData(zip),
            ...LoadUsageData(zip),
            ...LoadSpinogramData(zip),
            ...LoadCrowdMovies(zip, tmpdir),
        };
        await store.dispatch('datasets/setData', data);
        zip.close();
        for (const p of (store.state as any).filters.items) {
            store.dispatch(`${p}/initialize`);
        }
        app.$bvToast.toast('File "' + filename + '" was loaded successfully.', {
            title: 'Data loaded successfully!',
            variant: 'success',
            toaster: 'b-toaster-bottom-right',
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

function LoadCrowdMovies(zip, dir) {
    const dest = path.join(dir, 'crowd_movies');
    fs.mkdirSync(dest);
    zip.extract('crowd_movies', dest, (err, count) => {
        // tslint:disable-next-line:no-console
        console.log(err ? 'Extract error' : `Extracted ${count} crowd movie entries`);
    });
    return {};
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
