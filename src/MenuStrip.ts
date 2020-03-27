import { remote, Menu, MenuItem } from 'electron';
import LoadDataBundle from '@/models/DataLoader';

import { DehydratedDataWindow } from '@/store/datawindow.types';
import store from '@/store/root.store';
import app from '@/main';
import path from 'path';
import fs from 'fs';


/**
 * Creates the main menu strip for the electron app
 * in the renderer process. This will also populate
 * the menu with widgets that are registered to the
 * application.
 *
 * @export
 * @returns {Menu}      The menu object to be used as
 *                      the main menu strip for the app.
 */
export default function createMainMenu(): Menu {
    const menu: Menu = createMainMenuStrip();
    createAddWidgetSubmenu(menu);
    return menu;
}

/**
 * Creates the main menu strip for the electron app.
 *
 * @export
 * @returns {Menu}      Electron menu to be made the main
 *                      menu strip for the app.
 */
function createMainMenuStrip(): Menu {
    const menu: Menu = remote.Menu.buildFromTemplate([
        // ********************** FILE MENU **********************
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
        // ********************** EDIT MENU **********************
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
        // ********************** TOOLS MENU **********************
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Add Widget..',
                    type: 'submenu',
                    submenu: [],
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Reload',
                    type: 'normal',
                    role: 'reload',
                },
                {
                    label: 'Force Reload',
                    type: 'normal',
                    role: 'forceReload',
                },
                {
                    label: 'Toggle Dev Tools',
                    type: 'normal',
                    role: 'toggleDevTools',
                },
            ],
        },
        // ********************** VIEW MENU **********************
        {
            label: 'View',
            submenu: [
                {
                    label: 'Save Layout',
                    type: 'normal',
                    click: (): void => { store.dispatch('datawindows/serializeLayout'); },
                },
                {
                    label: 'Load Layout',
                    type: 'normal',
                    click: (): void => { loadLayoutFromFile(); },
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Clear Layout',
                    type: 'normal',
                    click: (): void => { store.dispatch('datawindows/clearLayout'); },
                },
                {
                    label: 'Default Layout',
                    type: 'normal',
                    click: (): void => { store.dispatch('datawindows/loadDefaultLayout'); },
                },
            ],
        },
    ]);

    return menu;
}

/**
 * Populates the 'Add Widget...' menu with the components and their
 * registration information dynamically. A click event gets generated
 * that links the component registration information to the buttons
 * properly without relying on the order.
 *
 * @param {Menu} menu   The main menu strip that will get updated and
 *                      changed based on all component registrations.
 */
function createAddWidgetSubmenu(menu: Menu) {
    const toolsMenu: MenuItem = menu.items[2];
    const addWidgetMenu: Menu = toolsMenu.submenu!.items[0].submenu as Menu;

    for (const component of store.state.registry) {
        const newItem: MenuItem = new remote.MenuItem({
            label: component.friendly_name,
            type: 'normal',
            click: (): void => {
                store.dispatch('datawindows/createWindow', component);
            },
        });

        addWidgetMenu.append(newItem);
    }
}

/**
 * Opens a file dialog and reads in the file selected as json.
 *
 * @returns {void}
 */
export function openNewFileButton(): void {
    let currDir: string = process.cwd();
    currDir = path.join(currDir);

    const filenames = remote.dialog.showOpenDialogSync({properties: ['openFile'], defaultPath: currDir});
    if (filenames === undefined) { return; }

    app.$bvToast.toast('Hang tight... We\'re getting your data ready', {
        title: 'Loading Data',
        variant: 'info',
        toaster: 'b-toaster-bottom-right',
    });
    new Promise((_) => setTimeout(_, 100))
        .then(() => LoadDataBundle(filenames[0]))
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

/**
 * Opens a file dialog for json files pertaining to the layout of the webapp
 * widget windows.
 *
 * @returns {void}
 */
function loadLayoutFromFile(): void {
    const currDir: string = process.cwd();
    const filenames = remote.dialog.showOpenDialogSync({properties: ['openFile'], defaultPath: currDir});
    if (filenames === undefined) { return; }

    const data = fs.readFileSync(filenames[0]).toString();
    const content: DehydratedDataWindow[] = JSON.parse(data) as DehydratedDataWindow[];
    store.dispatch('datawindows/loadLayout', content);
}
