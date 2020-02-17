import { remote, Menu, MenuItem, MenuItemConstructorOptions } from 'electron';
import LoadDataBundle from '@/models/DataLoader';

import { createDataWindow, ComponentRegistration, DehydratedDataWindow } from '@/store/root.types';
import store from '@/store/root.store';

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
                    click: (): void => { store.dispatch('serializeLayout'); },
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
                    click: (): void => { store.commit('clearLayout'); },
                },
                {
                    label: 'Default Layout',
                    type: 'normal',
                    click: (): void => { store.dispatch('loadDefaultLayout'); },
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
    const addWidgetMenu: Menu = toolsMenu.submenu.items[0].submenu;

    const components: ComponentRegistration[] = store.state.registry;
    for (const component of components) {
        const newItem: MenuItem = new remote.MenuItem({
            label: component.friendly_name,
            type: 'normal',
            click: (): void => {
                const win = createDataWindow(component);
                store.commit('addWindow', win);
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
    const path = require('path');
    const fs = require('fs');

    let currDir: string = process.cwd();
    currDir = path.join(currDir, 'src', 'metadata');

    const filenames = remote.dialog.showOpenDialogSync({properties: ['openFile'], defaultPath: currDir});
    if (filenames === undefined) { return; }

    LoadDataBundle(filenames[0]);
}

/**
 * Creates a new window based off of the menu item clicked on
 * and adds it to the view.
 *
 * @param {number} componentIndex   Index representing what type
 *                                  of widget is going to be created.
 */
function addWindow(componentIndex: number): void {
    const components: ComponentRegistration[] = store.state.registry;
    const componentInfo: ComponentRegistration = components[componentIndex];

    const win = createDataWindow(componentInfo);
    store.commit('addWindow', win);
}

/**
 * Opens a file dialog for json files pertaining to the layout of the webapp
 * widget windows.
 *
 * @returns {void}
 */
function loadLayoutFromFile(): void {
    const fs = require('fs');

    const currDir: string = process.cwd();
    const filenames = remote.dialog.showOpenDialogSync({properties: ['openFile'], defaultPath: currDir});
    if (filenames === undefined) { return; }

    const content: DehydratedDataWindow[] = JSON.parse(fs.readFileSync(filenames[0])) as DehydratedDataWindow[];
    store.dispatch('loadLayout', content);
}
