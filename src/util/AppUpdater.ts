import { autoUpdater } from 'electron-updater';

class AppUpdater {

    public static getInstance(): AppUpdater {
        if (!AppUpdater.instance) {
            AppUpdater.instance = new AppUpdater();

            // Set the callbacks to be the class functions
            autoUpdater.autoDownload = false;
            // autoUpdater.on('update-avialable', AppUpdater.instance.updateAvailable);
            // autoUpdater.on('update-downloaded', AppUpdater.instance.updateDownloaded);
            // autoUpdater.on('update-not-available', AppUpdater.instance.updateNotAvailable);
            // autoUpdater.on('error', (error: any) => { AppUpdater.instance.errorFunc(error); });
        }

        return AppUpdater.instance;
    }
    private static instance: AppUpdater;

    private log: any = require('electron-log');

    private constructor() {

        if (process.env.NODE_ENV === 'production') {
            this.log.transports.file.level = 'info';
        } else {
            this.log.transports.file.level = 'debug';
        }
        autoUpdater.logger = this.log;
    }

    public checkForUpdates(): void {
        this.log.info('Checking for updates...');
        autoUpdater.checkForUpdatesAndNotify();
    }

    public downloadUpdates(): void {
        autoUpdater.downloadUpdate();
    }

    public restartAndInstall(): void {
        autoUpdater.quitAndInstall();
    }

    public setFeedUrl(data: any) {
        autoUpdater.setFeedURL(data);
    }

    public addCallback(eventName: string, doSomething: (...args: any) => void): void {
        autoUpdater.on(eventName, doSomething);
    }
}

export const Updater: AppUpdater = AppUpdater.getInstance();
