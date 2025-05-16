import { MenuEvents } from "../../shared/menuAPI";
import { ipcMain, dialog } from "electron";

ipcMain.on(MenuEvents.OPEN_DATA, (event) => {
    event.sender.send('ready-to-load-file');
});
ipcMain.on(MenuEvents.CREATE_COMPONENT, (event, arg) => {
    event.sender.send(MenuEvents.CREATE_COMPONENT, arg);
});

ipcMain.on(MenuEvents.ABOUT_WINDOW, () => {});
