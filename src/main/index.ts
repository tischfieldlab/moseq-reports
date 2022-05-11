"use strict";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import { join } from "path";
import * as remoteMain from "@electron/remote/main";

import {
    setupTitlebar,
    attachTitlebarToWindow,
    // @ts-ignore
} from "custom-electron-titlebar/main";
remoteMain.initialize();

import "./events/menuEvents";

// setup the titlebar main process
setupTitlebar();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

let win: BrowserWindow | null = null;

async function createWindow() {
    win = new BrowserWindow({
        title: "MoSeq Reports",
        icon: join("img", "mouse.png"),
        webPreferences: {
            preload: join(__dirname, "../preload/index.cjs"),
            nodeIntegration: true,
            contextIsolation: false,
        },
        frame: false,
        titleBarStyle: "hidden",
        backgroundColor: "#FFFFFF",
        width: 1280,
        height: 720,
    });

    remoteMain.enable(win.webContents);

    if (app.isPackaged) {
        win.loadFile(join(__dirname, "../renderer/index.html"));
    } else {
        // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
        const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}`;

        win.loadURL(url);
        win.webContents.openDevTools();
    }

    // Test active push message to Renderer-process
    win.webContents.on("did-finish-load", () => {
        win?.webContents.send(
            "main-process-message",
            new Date().toLocaleString()
        );
    });

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "allow" };
    });

    attachTitlebarToWindow(win);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    win = null;
    if (process.platform !== "darwin") app.quit();
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
    }
});
