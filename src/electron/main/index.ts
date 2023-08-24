import { app, BrowserWindow, shell, ipcMain } from "electron";
import { release } from "os";
import { join } from "path";
import installExtension, { VUEJS3_DEVTOOLS, VUEJS_DEVTOOLS } from "electron-devtools-installer";
import * as remoteMain from "@electron/remote/main";
import "./events/Listeners";

import {
  setupTitlebar,
  attachTitlebarToWindow,
  // @ts-ignore
} from "custom-electron-titlebar/main";
import { DataServer } from "../../dataserver/index";
remoteMain.initialize();



setupTitlebar();

const isDevelopment = process.env.NODE_ENV !== "production";

const dataServer: DataServer = new DataServer();

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

export const ROOT_PATH = {
  // /dist
  dist: join(__dirname, "../.."),
  // /dist or /public
  public: join(__dirname, app.isPackaged ? "../.." : "../../../public"),
};

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin
const url = process.env["VITE_DEV_SERVER_URL"] || "localhost";
const indexHtml = join(ROOT_PATH.dist, "index.html");

async function createWindow() {
  win = new BrowserWindow({
    icon: join(ROOT_PATH.public, "img", "msq.ico"),
    frame: false,
    titleBarStyle: "hidden",
    // titleBarOverlay: true,
    backgroundColor: "#FFFFFF",
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 1280,
    height: 720,
  });

  remoteMain.enable(win.webContents);

  if (app.isPackaged) {
    win.loadFile(indexHtml);
  } else {
    win.loadURL(url);
    win.webContents.openDevTools();
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  attachTitlebarToWindow(win);
}

app
  .whenReady()
  .then(async () => {
    if (isDevelopment && !process.env.IS_TEST) {
      // Install extensions
      await installExtension(VUEJS_DEVTOOLS)
        .then((name) => console.log(`Added Extension: ${name}`)) // tslint:disable-line:no-console
        .catch((err) => console.error(`Failed to install extension:`, err.toString())); // tslint:disable-line:no-console
    }
  })
  .then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") {
    dataServer.shutdown();
    app.quit();
  }
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();

    // This can really live anywhere, but we would like to at least keep the
    // life cycle management of the dataserver connected to the main process
    // so that we can wrap the dataserver in the same lifecycle as the main
    // process.
    dataServer.init();
  }
});

// new window example arg: new windows url
ipcMain.handle("open-win", (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
    },
  });

  if (app.isPackaged) {
    childWindow.loadFile(indexHtml, { hash: arg });
  } else {
    childWindow.loadURL(`${url}/#${arg}`);
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
  }
});

