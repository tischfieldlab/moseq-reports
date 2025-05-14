import { Menu, MenuItem } from "@electron/remote";
import { ipcRenderer } from "electron";
import { MenuEvents } from "../shared/Events";
import showAboutWindow from "../../renderer/commands/ShowAbout";
// Future: import { CheckUpdates } from "../../renderer/commands/LoadUpdates";
// Future: import { documentation } from "../../../package.json";
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
let localMenu: Electron.Menu = createMainMenu();

export function createMainMenu(forceRebuild = false): Electron.Menu {
    const menu = Menu.buildFromTemplate(createMainMenuStripOptions());
    Menu.setApplicationMenu(menu);
    return menu;
}


/**
 * Creates the main menu constructor options
 *
 * @export
 * @returns {Electron.MenuItemConstructorOptions[]}      Electron menu to be made the main
 *                      menu strip for the app.
 */
function createMainMenuStripOptions(): Electron.MenuItemConstructorOptions[] {
    return [{
        label: "File",
        submenu: [{
            label: "Open Data...",
            accelerator: "CmdOrCtrl+O",
            type: "normal",
            click: () => {
                ipcRenderer.send(MenuEvents.OPEN_DATA);
            },
        }, {
            type: "separator"
        }, {
            label: "Exit",
            accelerator: "Alt+F4",
            type: "normal",
            click: (_item, win) => {
                win?.close();
            },
        }],
    }, {
        label: "Edit",
        submenu: [
            { label: "Undo", role: "undo", accelerator: "CmdOrCtrl+Z" },
            { label: "Redo", role: "redo", accelerator: "CmdOrCtrl+Y" },
            { type: "separator" },
            { label: "Cut", role: "cut", accelerator: "CmdOrCtrl+X" },
            { label: "Copy", role: "copy", accelerator: "CmdOrCtrl+C" },
            { label: "Paste", role: "paste", accelerator: "CmdOrCtrl+V" },
        ],
    }, {
        id: "menu-tools",
        label: "Tools",
        submenu: [],
    }, {
        label: "View",
        submenu: [{
            id: "menu-view-snapshot-workspace",
            label: "Snapshot Workspace...",
            type: "normal",
            click(_item, window) {
                // window?.webContents.send(MenuEvents.SNAPSHOT_WORKSPACE);
            },
        }, {
            label: "Sidebar Position...",
            submenu: [{
                label: "Left",
                type: "radio",
                click: (mi) => {
                    // SetSidebarLeft();
                    mi.checked = true;
                },
            }, {
                label: "Right",
                type: "radio",
                click: (mi) => {
                    // SetSidebarRight();
                    mi.checked = true;
                },
            },],
        }, {
            type: "separator"
        }, {
            id: "menu-view-save-layout",
            label: "Save Layout...",
            type: "normal",
            click: () => {
                // SaveLayout();
            },
        }, {
            id: "menu-view-load-layout",
            label: "Load Layout...",
            type: "normal",
            click: () => {
                // loadLayoutCommand();
            },
        }, {
            id: "menu-view-clear-layout",
            label: "Clear Layout",
            type: "normal",
            click: () => {
                // ClearLayout();
            },
        }, {
            id: "menu-view-default-layout",
            label: "Default Layout",
            type: "normal",
            click: () => {
                // LoadDefaultLayout();
            },
        }, {
            type: "separator"
        },
        { label: "Reload", role: "reload" },
        { label: "Force Reload", role: "forceReload" },
        { label: "Toggle Dev Tools", role: "toggleDevTools" },
        ],
    },
    {
        label: "Help",
        submenu: [
            {
                label: "Check for Updates...",
                type: "normal",
                click: () => {
                    // CheckUpdates();
                },
            },
            { type: "separator" },
            {
                label: "About",
                type: "normal",
                click: () => showAboutWindow(),
            },
            // {
            //   label: "User Guide",
            //   type: "normal",
            //   click: () => shell.openExternal(documentation),
            // },
        ],
    },
    ];
}



ipcRenderer.on("available-components-response", (_event, components) => {
    console.log("✅ Received components in menu-strip:", components);
    let toolsMenu = localMenu?.items.find(item => item.id === "menu-tools");

    if (toolsMenu && toolsMenu.submenu) {
        // clear existing tools (in case this is re-run)

        components
            .sort((a, b) => a.friendly_name.localeCompare(b.friendly_name))
            .forEach((cr) => {
                toolsMenu.submenu?.append(
                    new MenuItem({
                        label: cr.friendly_name,
                        type: "normal",
                        enabled: false, // initially disabled
                        click: () => ipcRenderer.send("create-component", cr),
                    })
                );
            });

        // ✅ This is CRUCIAL!
        Menu.setApplicationMenu(localMenu);
    }
});


// ✅ Enable/disable tools on dataset load state
ipcRenderer.on("dataset-loaded-state", (_event, isLoaded: boolean) => {
    const toolsMenu = localMenu?.getMenuItemById("menu-tools");
    if (!toolsMenu || !toolsMenu.submenu) return;

    toolsMenu.submenu.items.forEach((item) => {
        item.enabled = isLoaded;
    });

    Menu.setApplicationMenu(localMenu);
});
