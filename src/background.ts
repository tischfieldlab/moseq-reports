'use strict';
declare const __static: any;

import {ipcMain, app, protocol, BrowserWindow, IpcMainEvent} from 'electron';
import path from 'path';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import logger from 'electron-log';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

const isDevelopment = process.env.NODE_ENV !== 'production';

const instances: BrowserWindow[] = [];
const instanceArgs = {} as {[id:string]: string[]};
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// let win: BrowserWindow | null;


// Bootstrap App
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    attachApp();
    attachAutoUpdater();
}


function createWindow(argv: string[]) {
    // Create the browser window.
    const win = new BrowserWindow({
        icon: path.join(__static, 'img', 'mouse.png'),
        width: 800,
        height: 600,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: '#FFFFFF',
        webPreferences: {
            nodeIntegration: !!process.env.ELECTRON_NODE_INTEGRATION,
            nodeIntegrationInWorker: true,
            sandbox: false,
            enableRemoteModule: true,
        },
    }) as BrowserWindow;

    const identifier = win.webContents.id;
    instanceArgs[identifier] = argv;

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        setTimeout(() => {
            // Load the url of the dev server if in development mode
            win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
            if (!process.env.IS_TEST) {
                win.webContents.openDevTools();
            }
        }, 100);
    } else {
        createProtocol('app');
        // Load the index.html when not in development
        win.loadURL('app://./index.html');
    }

    win.on('closed', () => {
        delete instanceArgs[identifier];
        instances.splice(instances.indexOf(win), 1);
    });
    instances.push(win);
    return win;
}


function attachApp() {
    // Scheme must be registered before the app is ready
    protocol.registerSchemesAsPrivileged([{
        scheme: 'app',
        privileges: {
            secure: true,
            standard: true,
            supportFetchAPI: true,
        },
    }]);
    app.on('second-instance', (event, argv, workingDirectory) => {
        createWindow(argv);
    });
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
        if (instances.length === 0) {
            createWindow(process.argv);
        }
    });

    // This needs to be added because somewhere in Vue this ready event gets
    // overwritten, so this wipes it all clean.
    // @ref: https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378
    // app.removeAllListeners('ready');
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.whenReady()
        .then(async () => {
            if (isDevelopment && !process.env.IS_TEST) {
                
                // Install extensions
                const extensions = [VUEJS_DEVTOOLS];
                await Promise.all(
                    extensions.map((extension) => {
                        installExtension(extension)
                            .then((name) => console.log(`Added Extension: ${name}`)) // tslint:disable-line:no-console
                            .catch((err) => console.error(`Failed to install extension '${extension}':`, err.toString())); // tslint:disable-line:no-console
                        
                    })
                );
            }
        })
        .then(() => createWindow(process.argv));


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

    ipcMain.on('needs-reload', (event) => {
        event.sender.reload();
        (event.sender as any).hasReloaded = true;
        event.sender.send('window-has-reloaded');
    });

    ipcMain.on('app-ready', (event) => {
        const args = instanceArgs[event.sender.id];
        const filepath = args[args.length - 1];
        if (filepath.endsWith('.msq')) {
            event.sender.send('ready-to-load-file', filepath);
        }
    });
}


function attachAutoUpdater() {
    // NOTE: Setup the autoupdater so it works only in production
    const autoUpdaterOptions: any = {
        provider: 'github',
        owner: 'tischfieldlab',
        repo: 'moseq-reports',
        private: false,
    };

    autoUpdater.setFeedURL(autoUpdaterOptions);
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.autoDownload = false;

    // NOTE: Event sent from the render process to start the update check
    ipcMain.on('updater-start-update-check', (event: IpcMainEvent) => {
        autoUpdater.checkForUpdates().then((result: UpdateCheckResult) => {
            // NOTE: Send back an event saying the update check was completed
            event.sender.send('updater-finish-update-check', result.updateInfo.version);
        }).catch((reason: any) => {
            // NOTE: This error occurs most likely because of an authentication issue... so we will
            // ignore it for now as the repo may become public
            logger.error('Attempted to check for updates but ran into error: ', reason);
            event.sender.send('updater-finish-update-check', 'error');
        });
    });

    // NOTE: Sent from the render process if the user decides they want to download the update
    ipcMain.on('updater-start-update-download', (event: IpcMainEvent) => {
        autoUpdater.downloadUpdate().then(() => {
            // NOTE: Send message to the renderer proc that the update was completed.
            event.sender.send('updater-finish-update-download', 'success');
            autoUpdater.quitAndInstall();
        }).catch((reason: any) => {
            // NOTE: Send back error...
            logger.error('Attempted to download the update but ran into error: ', reason);
            event.sender.send('updater-finish-update-download', 'success');
            autoUpdater.quitAndInstall();
        });
    });

    // NOTE: Both of these events are dependent on whether or not the user chooses to download the updates

    // NOTE: If we are to install updates now
    ipcMain.on('updater-restart-and-install-now', (event: IpcMainEvent) => {
        autoUpdater.quitAndInstall();
    });

    // NOTE: If we are to install when the user quits
    ipcMain.on('updater-restart-and-install-later', (event: IpcMainEvent) => {
        autoUpdater.autoInstallOnAppQuit = true;
    });
}
