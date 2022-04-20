// import { remote, Menu, MenuItem } from "";
import { Menu, app } from "@electron/remote";
// import loadDataCommand, { IsDataLoaded } from "@/commands/LoadData";
// import loadLayoutCommand, {
//     LoadDefaultLayout,
//     ClearLayout,
//     SaveLayout,
// } from "@/commands/LoadLayout";
// import { AvailableComponents, CreateComponent } from "@/commands/Windows";
// import showAboutWindow from "@/commands/ShowAbout";
// import { CheckUpdates } from "@/commands/LoadUpdates";
// import {
//     SetSidebarLeft,
//     SetSidebarRight,
//     isSidebarLeft,
//     isSidebarRight,
// } from "@/commands/SidebarPosition";
// import { SnapshotWorkspace } from "@/components/Core/SnapshotHelper";
import store from "./store/root.store";

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
let localMenu: any | undefined;
export default function createMainMenu(forceRebuild = false): any {
    if (localMenu === undefined || forceRebuild) {
        localMenu = Menu.buildFromTemplate(createMainMenuStripOptions());
    }
    return localMenu;
}
createMainMenu();

/**
 * Below, watch the store for change to the datasets module `isLoaded` state,
 * which indicates that some data has been loaded into the application. On change
 * of state, toggle the enabled-ness of some menu items appropriately.
 *
 * Some menu items rely on data being loaded into the application, so we want to
 * disable these until data is loaded.
 *
 * Below, enter menu item IDs into `menuItemsDependingOnLoadedData`.
 * You may also append '.*' to the menu ID for the effect to apply recursively
 * to all submenu items.
 */
const menuItemsDependingOnLoadedData = [
    "menu-tools.*",
    "menu-view-load-layout",
    "menu-view-default-layout",
    "menu-view-save-layout",
    "menu-view-clear-layout",
    "menu-view-snapshot-workspace",
];
store.watch(
    (state) => (state as any).datasets.isLoaded,
    (newValue, oldValue) => {
        menuItemsDependingOnLoadedData.forEach((menuId) => {
            if (localMenu) {
                if (menuId.endsWith(".*")) {
                    const mi = localMenu.getMenuItemById(
                        menuId.replace(".*", "")
                    );
                    set_menu_item_enabled_recursively(mi, newValue);
                } else {
                    const mi = localMenu.getMenuItemById(menuId);
                    mi.enabled = newValue;
                }
            }
        });
    },
    {
        immediate: true,
    }
);
function set_menu_item_enabled_recursively(
    menuItem: any,
    enabledValue: boolean,
    includeTop = false
) {
    if (includeTop) {
        menuItem.enabled = enabledValue;
    }
    menuItem.submenu?.items.forEach((smi) =>
        set_menu_item_enabled_recursively(smi, enabledValue, true)
    );
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
            label: "File",
            submenu: [
                {
                    label: "Open Data...",
                    type: "normal",
                    accelerator: "CmdOrCtrl+O",
                    // click: loadDataCommand,
                },
                {
                    type: "separator",
                },
                {
                    label: "Exit",
                    type: "normal",
                    accelerator: "Alt+F4",
                    click: () => {
                        app.quit();
                    },
                },
            ],
        },
        // ********************** EDIT MENU **********************
        {
            label: "Edit",
            submenu: [
                {
                    label: "Undo",
                    type: "normal",
                    accelerator: "CmdOrCtrl+Z",
                    role: "undo",
                },
                {
                    label: "Redo",
                    type: "normal",
                    accelerator: "CmdOrCtrl+Y",
                    role: "redo",
                },
                {
                    type: "separator",
                },
                {
                    label: "Cut",
                    type: "normal",
                    accelerator: "CmdOrCtrl+X",
                    role: "cut",
                },
                {
                    label: "Copy",
                    type: "normal",
                    accelerator: "CmdOrCtrl+C",
                    role: "copy",
                },
                {
                    label: "Paste",
                    type: "normal",
                    accelerator: "CmdOrCtrl+V",
                    role: "paste",
                },
            ],
        },
        // ********************** TOOLS MENU **********************
        {
            id: "menu-tools",
            label: "Tools",
            // submenu: AvailableComponents()
            //     .sort((a, b) => a.friendly_name.localeCompare(b.friendly_name))
            //     .map((cr) => {
            //         return {
            //             label: cr.friendly_name,
            //             type: "normal",
            //             click: () => CreateComponent(cr),
            //         } as Electron.MenuItemConstructorOptions;
            //     }),
        },
        // ********************** VIEW MENU **********************
        {
            label: "View",
            submenu: [
                {
                    id: "menu-view-snapshot-workspace",
                    label: "Snapshot Workspace...",
                    type: "normal",
                    // click: () => SnapshotWorkspace(),
                },
                {
                    label: "Sidebar Position...",
                    type: "submenu",
                    submenu: [
                        {
                            label: "Left",
                            type: "radio",
                            // checked: isSidebarLeft(),
                            // click: (mi) => {
                            //     SetSidebarLeft();
                            //     mi.checked = true;
                            // },
                        },
                        {
                            label: "Right",
                            type: "radio",
                            // checked: isSidebarRight(),
                            // click: (mi) => {
                            //     SetSidebarRight();
                            //     mi.checked = true;
                            // },
                        },
                    ],
                },
                {
                    type: "separator",
                },
                {
                    id: "menu-view-save-layout",
                    label: "Save Layout...",
                    type: "normal",
                    click: (): void => {
                        // SaveLayout();
                    },
                },
                {
                    id: "menu-view-load-layout",
                    label: "Load Layout...",
                    type: "normal",
                    // click: loadLayoutCommand,
                },
                {
                    id: "menu-view-clear-layout",
                    label: "Clear Layout",
                    type: "normal",
                    click: (): void => {
                        // ClearLayout();
                    },
                },
                {
                    id: "menu-view-default-layout",
                    label: "Default Layout",
                    type: "normal",
                    click: (): void => {
                        // LoadDefaultLayout();
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "Reload",
                    type: "normal",
                    role: "reload",
                },
                {
                    label: "Force Reload",
                    type: "normal",
                    role: "forceReload",
                },
                {
                    label: "Toggle Dev Tools",
                    type: "normal",
                    role: "toggleDevTools",
                },
            ],
        },
        // ********************** HELP MENU **********************
        {
            label: "Help",
            submenu: [
                {
                    label: "Check for Updates...",
                    type: "normal",
                    click: (): void => {
                        // CheckUpdates();
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "About",
                    type: "normal",
                    click: (): void => {
                        // showAboutWindow();
                    },
                },
            ],
        },
    ];
}
