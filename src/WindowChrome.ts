import { Titlebar, Color } from 'custom-electron-titlebar';
import createMainMenu from './MenuStrip';
import { ipcRenderer } from 'electron';
import { UpdateCheckResult } from 'electron-updater';
import { UpdateCheck } from '@/commands/LoadUpdates';

let titlebar: Titlebar|undefined;

ipcRenderer.on('update-check', (event: any, data: UpdateCheckResult) => {
    UpdateCheck();
    ipcRenderer.send('update-check-done');
});

export function CreateTitleBar() {
    DisposeTitlebar();
    titlebar = new Titlebar({
        icon: '/img/mouse.png',
        backgroundColor: Color.fromHex('#FFFFFF'),
        menu: createMainMenu(),
        shadow: false,
    });
}

export function DisposeTitlebar() {
    if (titlebar !== undefined) {
        titlebar.dispose();
        titlebar = undefined;
    }
}

export function GetTitlebar() {
    return titlebar;
}

export function UpdateTitle(title: string) {
    if (titlebar !== undefined) {
        titlebar.updateTitle(title);
    }
}

if (module.hot) {
    module.hot?.addDisposeHandler(() => DisposeTitlebar());
}
