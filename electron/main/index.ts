import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
import * as remoteMain from '@electron/remote/main';
import './events/Listeners';

import {
  setupTitlebar,
  attachTitlebarToWindow,
} from 'custom-electron-titlebar/main';
import { DataServer } from '../dataserver/index';

setupTitlebar(); // Ensure titlebar is set up

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDevelopment = process.env.NODE_ENV !== 'production';
const dataServer: DataServer = new DataServer();

// The built directory structure
process.env.APP_ROOT = path.join(__dirname, '../..');
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, '../preload/index.mjs');
const indexHtml = path.join(RENDERER_DIST, 'index.html');

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'msq.ico'),
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#FFFFFF',
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
    },
    width: 1280,
    height: 720,
  });

  remoteMain.enable(win.webContents);
  

  if (app.isPackaged) {
    win.loadFile(indexHtml);
  } else {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  attachTitlebarToWindow(win); // Attach the titlebar to the window
}

app.whenReady().then(async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue 3 devtools extension
    await installExtension(VUEJS3_DEVTOOLS)
      .then((name) => console.log(`Added Extension: ${name}`))
      .catch((err) => console.error('Failed to install extension:', err.toString()));
  }
  createWindow();
});

app.on('window-all-closed', () => {
  win = null;
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
    dataServer.init(); // Initialize dataServer on activation
  }
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
