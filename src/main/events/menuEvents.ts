import { ipcMain } from "electron";
import showAboutWindow from "../../renderer/src/commands/ShowAbout";
import { MenuEvents } from "../../core/events/Events";

ipcMain.on(MenuEvents.OPEN_ABOUT_WINDOW, () => {
    showAboutWindow();
});
