import { remote, Menu } from 'electron';
import DataModel, { MetadataJson } from '@/models/DataModel';

export default function createMainMenuStrip(): Menu {
    const menu: Menu = remote.Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open...',
                    type: 'normal',
                    accelerator: 'CmdOrCtrl+O',
                    click: openNewFileButton,
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Exit',
                    type: 'normal',
                    accelerator: 'Alt+F4',
                    click: () => { remote.app.quit(); },
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    type: 'normal',
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'undo',
                },
                {
                    label: 'Redo',
                    type: 'normal',
                    accelerator: 'CmdOrCtrl+Y',
                    role: 'redo',
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Cut',
                    type: 'normal',
                    accelerator: 'CmdOrCtrl+X',
                    role: 'cut',
                },
                {
                    label: 'Copy',
                    type: 'normal',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy',
                },
                {
                    label: 'Paste',
                    type: 'normal',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste',
                },
            ],
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Add Window...',
                    type: 'submenu',
                    submenu: [
                        {
                            label: 'Usage Details',
                            type: 'normal',
                        },
                        {
                            label: 'Usage Heatmap',
                            type: 'normal',
                        },
                        {
                            label: 'Test Syllable',
                            type: 'normal',
                        },
                    ],
                },
                {
                    label: 'Remove Window...',
                    type: 'submenu',
                    submenu: [
                        {
                            label: 'Usage Details',
                            type: 'normal',
                        },
                        {
                            label: 'Usage Heatmap',
                            type: 'normal',
                        },
                        {
                            label: 'Test Syllable',
                            type: 'normal',
                        },
                    ],
                },
            ],
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Save Layout',
                    type: 'normal',
                },
                {
                    label: 'Load Layout',
                    type: 'normal',
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Clear Layout',
                    type: 'normal',
                },
                {
                    label: 'Default Layout',
                    type: 'normal',
                },
            ],
        },
    ]);

    return menu;
}

function openNewFileButton(): void {
    const path = require('path');
    const fs = require('fs');

    let currDir: string = process.cwd();
    currDir = path.join(currDir, 'src', 'metadata');

    const filenames = remote.dialog.showOpenDialogSync({properties: ['openFile'], defaultPath: currDir});
    if (filenames === undefined) { return; }

    const content: MetadataJson = JSON.parse(fs.readFileSync(filenames[0])) as MetadataJson;
    content.dataframeJson = JSON.parse(content.dataframeJson) as any;
    DataModel.loadMetadataFile(content);
}
