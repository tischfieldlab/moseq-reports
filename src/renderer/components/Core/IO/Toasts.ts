import { shell } from 'electron';
import {mapStackTrace} from 'sourcemapped-stacktrace';
import { app_root } from '@render/index';
import { h } from 'vue';
import {useHistoryStore} from '@store/history.store';

export function showSaveSuccessToast(dest: string, noun: string, showOrOpen: 'open'|'show' = 'open') {

    let clickHandler;
    if (showOrOpen === 'show') {
        clickHandler = () => shell.showItemInFolder(dest);
    } else {
        clickHandler = () => shell.openPath(dest);
    }

    const body = () => h('div', {}, [
                `Your ${noun} was saved successfully to `,
                h('a', {
                    href: 'javascript:void(0);',
                    title: `Click to ${showOrOpen}`,
                    onClick: clickHandler,
                }, dest),
            ]);

    app_root.$showToast({
        title: `Success saving ${noun}!`,
        variant: 'success',
        position: 'bottom-end',
        slots: {
            default: body
        },
    });
    useHistoryStore().addEntry({
        message: body,
        variant: 'success',
        details: noun,
    });
}


export function showSaveErrorToast(err: Error|string, noun: string) {
    new Promise<string|undefined>((resolve) => {
        if (err instanceof Error) {
            mapStackTrace(err.stack, (ms) => {
                // mapped trace does not include name or message, so add those.
                ms.unshift(`${err.name}: ${err.message}`);
                resolve(ms.join('\n'));
            });
        } else {
            resolve(undefined);
        }
    })
    .then((deets: string|undefined) => {
        app_root.$showToast({
            title: `Error saving ${noun}!`,
            variant: 'danger',
            position: 'bottom-end',
            body: err.toString(), 
        });
        useHistoryStore().addEntry({
            message: `Error saving ${noun}!`,
            variant: 'danger',
            details: deets,
        });
    });
}