import { ipcRenderer } from "electron";
import { MenuEvents } from "@main/shared/Events";

ipcRenderer.on(MenuEvents.SNAPSHOT_WORKSPACE, () => {
  console.log("snapshot-workspace");
});

ipcRenderer.on(MenuEvents.OPEN_DATA, (_event, path: string) => {
  console.log("open-data", path);
});
