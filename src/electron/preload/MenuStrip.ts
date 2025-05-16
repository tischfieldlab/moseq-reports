import { Menu } from "@electron/remote";
import { ipcRenderer } from "electron";
import { MenuEvents, ComponentRegistration, IMenuAPI } from "../shared/menuAPI";
import showAboutWindow from "../../renderer/commands/ShowAbout";
import { Titlebar, TitlebarColor } from "custom-electron-titlebar";
// Future: import { CheckUpdates } from "../../renderer/commands/LoadUpdates";
// Future: import { documentation } from "../../../package.json";





/**
 * Creates the main menu constructor options
 *
 * @export
 * @returns {Electron.MenuItemConstructorOptions[]}      Electron menu to be made the main
 *                      menu strip for the app.
 */
function createMainMenuStripOptions(menuBarManager: MenuBarManager): Electron.MenuItemConstructorOptions[] {
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
        submenu: menuBarManager.getRegisteredComponents().map((cr) => {
            return {
                label: cr.friendly_name,
                type: "normal",
                enabled: menuBarManager.isDataLoaded,
                click: (event, focusedWindow) => {
                    //console.log("✅ Creating component menu:", cr);
                    ipcRenderer.send(MenuEvents.CREATE_COMPONENT, cr);
                },
            }
        }),
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



export class MenuBarManager {
    private static _instance: MenuBarManager;
    private _titlebar: Titlebar;
    private _base_title: string = "Moseq Reports";
    private _is_data_loaded: boolean = false;
    private _loaded_filename: string | undefined = undefined;
    private _component_registry: ComponentRegistration[] = [];

    private constructor() {
        this.refreshMenu();
        this._titlebar = new Titlebar({
            shadow: false,
            backgroundColor: TitlebarColor.fromHex("#FFFFFF"),
        });
    }

    static getInstance(): MenuBarManager {
        if (!MenuBarManager._instance) {
            MenuBarManager._instance = new MenuBarManager();
        }
        return MenuBarManager._instance;
    }

    get isDataLoaded(): boolean {
        return this._is_data_loaded;
    }
    setBaseTitle(title: string) {
        this._base_title = title;
        this.refreshTitle();
    }
    setLoadedFilename(filename: string) {
        this._loaded_filename = filename;
        if (!this._is_data_loaded) {
            this._is_data_loaded = true;
            this.refreshMenu();
        }
        this.refreshTitle();
    }
    addComponentRegistration(component: ComponentRegistration) {
        const loc = this._component_registry.findIndex((r) => r.component_type === component.component_type);
        if (loc === -1) {
            this._component_registry.push(component);
        } else {
            console.warn(`${component.component_type} has already been registered! Merging...`);
            this._component_registry.splice(loc, 1, component);
        }
        this.refreshMenu();
    }
    getRegisteredComponents(): ComponentRegistration[] {
        return this._component_registry;
    }
    private refreshTitle() {
        if (this._is_data_loaded && this._loaded_filename) {
            this._titlebar.updateTitle(`${this._base_title} - ${this._loaded_filename}`);
        } else {
            this._titlebar.updateTitle(`${this._base_title}`);
        }
    }
    private refreshMenu() {
        const menu = Menu.buildFromTemplate(createMainMenuStripOptions(this));
        Menu.setApplicationMenu(menu);
        if (this._titlebar) {
            this._titlebar.refreshMenu();
        }
    }
}



const MenuBridge: IMenuAPI = {
    setBaseTitle: (title: string) => MenuBarManager.getInstance().setBaseTitle(title),
    setLoadedFilename: (filename: string) => MenuBarManager.getInstance().setLoadedFilename(filename),
    addComponentRegistration: (component: ComponentRegistration) => MenuBarManager.getInstance().addComponentRegistration(component),
}
window.menuAPI = MenuBridge;
