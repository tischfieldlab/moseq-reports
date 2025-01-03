import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { release } from "os";
import { join } from "path";
import { installExtension,  VUEJS_DEVTOOLS } from "electron-devtools-installer";
import * as remoteMain from "@electron/remote/main";
import "./events/Listeners";

import {
  setupTitlebar,
  attachTitlebarToWindow,
} from "custom-electron-titlebar/main";
import { DataServer } from "../../dataserver/index";

remoteMain.initialize();

import { fileURLToPath } from "url";
import { dirname } from "path";
//import { createRequire } from 'node:module'
// Create __dirname equivalent
//const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

setupTitlebar();

const isDevelopment = process.env.NODE_ENV !== "production";

let dataServer: DataServer | null = null;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

export const ROOT_PATH = {
  dist: join(__dirname, "../.."), // /dist
  public: join(__dirname, app.isPackaged ? "../.." : "../../../public"), // /dist or /public
};

let win: BrowserWindow | null = null;

const preload = join(__dirname, "../preload/index.mjs");
const url = process.env["VITE_DEV_SERVER_URL"] || "localhost";
const indexHtml = join(ROOT_PATH.dist, "index.html");

/**
 * Create the main application window.
 */
async function createWindow() {
  win = new BrowserWindow({
    icon: join(ROOT_PATH.public, "img", "msq.ico"),
    frame: false,
    titleBarStyle: "hidden",
    titleBarOverlay: true,
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
    win.webContents.openDevTools({ mode: "right" });
  }

  // Notify renderer of main process message
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Open external links in the browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  attachTitlebarToWindow(win);
}

app
  .whenReady()
  .then(async () => {
    // console.log(process.env.NODE_ENV)
    if (isDevelopment && !process.env.IS_TEST) {
      // Install extensions
      await installExtension(VUEJS_DEVTOOLS)
        .then((name) => console.log(`Added Extension2: ${name.name}`)) // tslint:disable-line:no-console
        .catch((err) => console.error(`Failed to install extension:`, err.toString())); // tslint:disable-line:no-console
    }
    try {
      console.log("Initializing DataServer...");
      dataServer = new DataServer((url) => {
        // Placeholder for resolving dataset file paths.
        return `/path/to/datasets/${url}`;
      });
      await dataServer.start();
      console.log(`DataServer started at ${dataServer.getAddress()}`);
    } catch (error) {
      console.error("Failed to start DataServer:", error);
    }
  })
  .then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  //if (process.platform !== "darwin") {
    if (dataServer) {
      dataServer.shutdown();
    }
    app.quit();
  //}
});

app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length) {
    BrowserWindow.getAllWindows()[0].focus();
  } else {
    createWindow();
    if (dataServer && !dataServer.isServerRunning()) {
      await dataServer.start();
    }
  }
});

// IPC Handlers for DataServer Lifecycle
ipcMain.handle("is-data-server-running", () => {
  return dataServer ? dataServer.isServerRunning() : false;
});

ipcMain.handle("get-data-server-address", () => {
  return dataServer ? dataServer.getAddress() : "Server not running.";
});

ipcMain.handle("get-file-path", () => {
  return dataServer ? dataServer.getfilepath() : "No File.";
});

ipcMain.handle("start-data-server", async () => {
  try {
    if (dataServer && !dataServer.isServerRunning()) {
      await dataServer.start();
      return { success: true, address: dataServer.getAddress() };
    } else {
      return { success: true, message: "DataServer is already running." };
    }
  } catch (error) {
    console.error("Error starting DataServer:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("shutdown-data-server", async () => {
  try {
    if (dataServer) {
      await dataServer.shutdown();
      return { success: true };
    } else {
      return { success: false, message: "DataServer is not running." };
    }
  } catch (error) {
    console.error("Error shutting down DataServer:", error);
    return { success: false, error: error.message };
  }
});
