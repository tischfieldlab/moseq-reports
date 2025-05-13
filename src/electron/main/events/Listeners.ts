import { MenuEvents } from "../../shared/Events";
import { ipcMain, dialog } from "electron";

ipcMain.on(MenuEvents.OPEN_DATA, (event) => {
    event.sender.send('ready-to-load-file');
});

ipcMain.on(MenuEvents.ABOUT_WINDOW, () => {});
