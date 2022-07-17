import { ipcRenderer } from "electron";
import { MenuEvents } from "@main/shared/Events";

ipcRenderer.on(MenuEvents.OPEN_DATA, () => {
  console.log("open-data");
});

ipcRenderer.on(MenuEvents.SNAPSHOT_WORKSPACE, () => {
  console.log("snapshot-workspace");
});
