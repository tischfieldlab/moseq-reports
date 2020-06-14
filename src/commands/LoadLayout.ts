import fs from 'fs';
import { DehydratedDataWindow } from '@/store/datawindow.types';
import store from '@/store/root.store';
import { remote } from 'electron';
import { saveFile } from '@/util/Files';


export default function() {
    const filenames = remote.dialog.showOpenDialogSync({
        properties: ['openFile'],
        // defaultPath: process.cwd(),
    });
    if (filenames === undefined) {
        return;
    }

    LoadLayoutFile(filenames[0]);
}

export function LoadDefaultLayout() {
    return fetch('/default_layout.json')
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        store.dispatch('datawindows/loadLayout', data);
    });
}

export async function LoadLayoutFile(filename: string) {
    const data = fs.readFileSync(filename).toString();
    let content = JSON.parse(data);
    if (Array.isArray(content)) {
        // old style, list of window layouts
        store.dispatch('datawindows/loadLayout', content);
        return;
    }
    content = content as {filters: any, layout: any};
    if (content.hasOwnProperty('filters')) {
        await store.dispatch('filters/loadFilters', content.filters);
    }
    if (content.hasOwnProperty('layout')) {
        await store.dispatch('datawindows/loadLayout', content.layout);
    }
}

export async function SaveLayout() {
    const layout = await store.dispatch('datawindows/serializeLayout');
    const filters = await store.dispatch('filters/serializeFilters');
    const data = {
        layout,
        filters,
    };
    const contents = JSON.stringify(data, null, '\t');
    saveFile('layout.json', 'data:text/json', contents);
}

export function ClearLayout() {
    store.dispatch('datawindows/clearLayout');
}
