import { autoUpdater } from 'electron-updater';

class AppUpdater {

    public static getInstance(): AppUpdater {
        if (!AppUpdater.instance) {
            AppUpdater.instance = new AppUpdater();
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
}

export const Updater: AppUpdater = AppUpdater.getInstance();
