import { app, BrowserWindow, ipcMain } from '@electron/remote';
import openAboutWindow from 'about-window';
import path from 'path';
declare const __static: any;

export default function showAboutWindow() {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    // uses https://github.com/rhysd/electron-about-window
    openAboutWindow({
        icon_path: path.join(__static, 'img', 'mouse.png'),
        ipcMain: ipcMain,
        app: app,
        BrowserWindow: BrowserWindow,
        open_devtools: isDevelopment,
    });
}
