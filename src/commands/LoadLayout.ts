import fs from 'fs';
import { DehydratedDataWindow } from '@/store/datawindow.types';
import store from '@/store/root.store';
import { remote } from 'electron';
import { saveFile } from '@/util/Files';


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
    fetch('/default_layout.json')
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        store.dispatch('datawindows/loadLayout', data);
    });
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
