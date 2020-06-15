'use strict';
declare const __static: any;

import {ipcMain, app, protocol, BrowserWindow } from 'electron';
import path from 'path';
import {
    createProtocol,
    installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

app.allowRendererProcessReuse = false;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged(
    [{
        scheme: 'app',
        privileges: {
            secure: true,
            standard: true,
            supportFetchAPI: true,
        },
    }]);

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        icon: path.join(__static, 'img', 'mouse.png'),
        width: 800,
        height: 600,
        frame: false,
        backgroundColor: '#FFFFFF',
        webPreferences: {
            nodeIntegration: true,
        },
    }) as BrowserWindow;

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        setTimeout(() => {
            // Load the url of the dev server if in development mode
            win!.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
            if (!process.env.IS_TEST) {
                win!.webContents.openDevTools();
            }
        }, 100);
    } else {
        createProtocol('app');
        // Load the index.html when not in development
        win.loadURL('app://./index.html');
    }

    win.on('closed', () => { win = null; });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// This needs to be added because somewhere in Vue this ready event gets
// overwritten, so this wipes it all clean.
// @ref: https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378
// app.removeAllListeners('ready');
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        // Devtools extensions are broken in Electron 6.0.0 and greater
        // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
        // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
        // If you are not using Windows 10 dark mode, you may uncomment these lines
        // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
        try {
            await installVueDevtools();
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.error('Vue Devtools failed to install:', e.toString());
        }
    }
    createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit();
            }
        });
    } else {
        process.on('SIGTERM', () => {
            app.quit();
        });
    }
}

ipcMain.on('needs-reload', () => {
    if (win !== null) {
        (win as any).hasReloaded = true;
        win.reload();
    }
});

import { autoUpdater, UpdateCheckResult } from 'electron-updater';
if (process.env.NODE_ENV === 'production') {

    ipcMain.on('update-check-done', (event: any) => {
        autoUpdater.downloadUpdate().then(async () => {
            if (win !== null) {
                await new Promise((resolve) => setTimeout(resolve, 5000));
                autoUpdater.quitAndInstall();
            }
        });
    });

    const data: any = {
        provider: 'github',
        owner: 'tischfieldlab',
        repo: 'moseq-reports',
        token: process.env.GITHUB_TOKEN,
    };

    autoUpdater.setFeedURL(data);

    autoUpdater.checkForUpdates().then((check: UpdateCheckResult) => {
        if (win !== null) {
            win.webContents.send('update-check', check);
        }
    });
}
