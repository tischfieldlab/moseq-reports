import fs from 'fs';
import { DehydratedDataWindow } from '@/store/datawindow.types';
import store from '@/store/root.store';
import { remote } from 'electron';


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

export function LoadLayoutFile(filename: string) {
    const data = fs.readFileSync(filename).toString();
    const content: DehydratedDataWindow[] = JSON.parse(data) as DehydratedDataWindow[];
    store.dispatch('datawindows/loadLayout', content);
}
