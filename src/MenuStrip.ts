import { remote, Menu, MenuItem } from 'electron';
import store from '@/store/root.store';
import loadDataCommand from '@/commands/LoadData';
import loadLayoutCommand from '@/commands/LoadLayout';


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
                    click: loadDataCommand,
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
                    label: 'Add Widget...',
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
                    click: loadLayoutCommand,
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
