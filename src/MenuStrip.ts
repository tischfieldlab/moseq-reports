import { remote, Menu } from 'electron';
import loadDataCommand from '@/commands/LoadData';
import loadLayoutCommand, {LoadDefaultLayout, ClearLayout, SaveLayout} from '@/commands/LoadLayout';
import {AvailableComponents, CreateComponent} from '@/commands/Windows';
import showAboutWindow from '@/commands/ShowAbout';
import {UpdateCheck} from '@/commands/LoadUpdates';
import {SnapshotWorkspace} from '@/components/Core/SnapshotHelper';

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
    return remote.Menu.buildFromTemplate(createMainMenuStripOptions());
}

/**
 * Creates the main menu constructor options
 *
 * @export
 * @returns {Electron.MenuItemConstructorOptions[]}      Electron menu to be made the main
 *                      menu strip for the app.
 */
function createMainMenuStripOptions(): Electron.MenuItemConstructorOptions[] {
    return [
        // ********************** FILE MENU **********************
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open Data...',
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
            submenu: AvailableComponents()
                        .sort((a, b) => a.friendly_name.localeCompare(b.friendly_name))
                        .map((cr) => {
                            return {
                                label: cr.friendly_name,
                                type: 'normal',
                                click: () => CreateComponent(cr),
                            } as Electron.MenuItemConstructorOptions;
                        }),
        },
        // ********************** VIEW MENU **********************
        {
            label: 'View',
            submenu: [
                {
                    label: 'Snapshot Workspace...',
                    type: 'normal',
                    click: () => SnapshotWorkspace(),
                },
                {
                    label: 'Save Layout...',
                    type: 'normal',
                    click: (): void => { SaveLayout(); },
                },
                {
                    label: 'Load Layout...',
                    type: 'normal',
                    click: loadLayoutCommand,
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Clear Layout',
                    type: 'normal',
                    click: (): void => { ClearLayout(); },
                },
                {
                    label: 'Default Layout',
                    type: 'normal',
                    click: (): void => { LoadDefaultLayout(); },
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
        // ********************** HELP MENU **********************
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Check for Updates...',
                    type: 'normal',
                    click: (): void => { UpdateCheck(); },
                },
                {
                    type: 'separator',
                },
                {
                    label: 'About',
                    type: 'normal',
                    click: (): void => { showAboutWindow(); },
                },
            ],
        },
    ];
}
