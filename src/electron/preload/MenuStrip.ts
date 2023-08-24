import { Menu } from "@electron/remote";
import { ipcRenderer } from "electron";
import { MenuEvents } from "../shared/Events";
import showAboutWindow from "../../renderer/commands/ShowAbout";

export function createMainMenu(): Electron.Menu {
  "use strict";
  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "&Open data...",
          type: "normal",
          accelerator: "CmdOrCtrl+O",
          // click: loadDataCommand,
          click: () => {
            ipcRenderer.send(MenuEvents.OPEN_DATA);
          },
        },
        {
          type: "separator",
        },
        {
          label: "Exit",
          type: "normal",
          accelerator: "Alt+F4",
          click: (_item, win, _event) => {
            win?.close();
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
      //     .sort((a, b) =>
      //         a.friendly_name.localeCompare(b.friendly_name)
      //     )
      //     .map((cr) => {
      //         return {
      //             label: cr.friendly_name,
      //             type: "normal",
      //             // click: () => CreateComponent(cr),
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
          click(_item, window, _event) {
            window?.webContents.send(MenuEvents.SNAPSHOT_WORKSPACE);
          },
        },
        {
          label: "Sidebar Position...",
          type: "submenu",
          submenu: [
            {
              label: "Left",
              type: "radio",
              // checked: isSidebarLeft(),
              click: (mi) => {
                // SetSidebarLeft();
                mi.checked = true;
              },
            },
            {
              label: "Right",
              type: "radio",
              // checked: isSidebarRight(),
              click: (mi) => {
                // SetSidebarRight();
                mi.checked = true;
              },
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
            showAboutWindow();
          },
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);

  return menu;
}
