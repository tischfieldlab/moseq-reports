import { app, BrowserWindow, ipcMain } from "@electron/remote";
import openAboutWindow from "about-window";

export default function showAboutWindow() {
  openAboutWindow({
    icon_path: "public/img/mouse.png",
    ipcMain: ipcMain,
    app: app,
    BrowserWindow: BrowserWindow,
    // icon_path: path.join(__static, "img", "mouse.png"),
    // package_json_dir: packageJsonDir,
    // open_devtools: isDevelopment,
  });
}
