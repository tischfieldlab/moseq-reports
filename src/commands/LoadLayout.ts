import fs from 'fs';
import path from 'path';
import { DehydratedDataWindow } from '@/store/datawindow.types';
import store from '@/store/root.store';
import { remote } from 'electron';
import { saveFile } from '@/util/Files';
import DefaultLayout from '@/DefaultLayout';


export default function() {
    const filenames = remote.dialog.showOpenDialogSync({
        properties: ['openFile'],
        defaultPath: process.cwd(),
    });
    if (filenames === undefined) {
        return;
    }

    LoadLayoutFile(filenames[0]);
}

export function LoadDefaultLayout() {
    // LoadLayoutFile(path.resolve('./default_layout.json'));
    store.dispatch('datawindows/loadLayout', DefaultLayout);
}

export function LoadLayoutFile(filename: string) {
    const data = fs.readFileSync(filename).toString();
    const content: DehydratedDataWindow[] = JSON.parse(data) as DehydratedDataWindow[];
    store.dispatch('datawindows/loadLayout', content);
}

export function SaveLayout() {
    const data = store.dispatch('datawindows/serializeLayout');
    const contents = JSON.stringify(data, null, '\t');
    saveFile('layout.json', 'data:text/json', contents);
}

export function ClearLayout() {
    store.dispatch('datawindows/clearLayout');
}
