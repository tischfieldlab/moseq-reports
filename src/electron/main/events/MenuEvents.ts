import { ipcMain } from "electron";
import { MenuEvents } from "@shared/Events";

ipcMain.on(MenuEvents.OPEN_ABOUT_WINDOW, () => {
  console.log("Open about window");
});
