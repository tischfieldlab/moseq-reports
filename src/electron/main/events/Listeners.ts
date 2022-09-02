import { MenuEvents } from "../../shared/Events";
import { ipcMain, dialog } from "electron";

ipcMain.on(MenuEvents.OPEN_DATA, (event) => {
  const filenames = dialog.showOpenDialogSync({
    properties: ["openFile"],
    filters: [
      { name: "MoSeq Data Files", extensions: ["msq"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
  if (filenames === undefined) {
    return;
  }

  console.log("in the main process", filenames[0]);
  event.sender.send(MenuEvents.OPEN_DATA, filenames[0]);
});

ipcMain.on(MenuEvents.ABOUT_WINDOW, () => {});