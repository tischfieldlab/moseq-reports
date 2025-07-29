import { shell } from 'electron';
import {mapStackTrace} from 'sourcemapped-stacktrace';
import { app_root } from '@render/index';
import { h } from 'vue';
import {useHistoryStore} from '@store/history.store';
import { BaseColorVariant, BSpinner } from 'bootstrap-vue-next';
import { v4 as uuidv4 } from 'uuid';


export function showStartSavingToast(title: string = 'Saving', message: string = 'Hang tight...') {
    return app_root.$showToast({
        id: `saving-toast-${uuidv4()}`,
        title: title,
        variant: 'info',
        isStatus: true,
        position: 'bottom-end',
        modelValue: true,
        slots: {
            default: () => h('div', {}, [
                h(BSpinner, {
                    type: 'grow',
                    small: true,
                    style: { 'margin-right': '1em' }
                }),
                message,
            ]),
        }
    });
}

export function showSaveSuccessToast(dest: string, noun: string, showOrOpen: 'open'|'show' = 'open') {

    const {path, clickHandler} = makeClickHandler(dest, showOrOpen);

    const body = () => h('div', {}, [
                `Your ${noun} was saved successfully to `,
                h('a', {
                    href: 'javascript:void(0);',
                    title: `Click to ${showOrOpen}`,
                    onClick: clickHandler,
                    class: 'text-light',
                }, path),
            ]);

    app_root.$showToast({
        title: `Success saving ${noun}!`,
        variant: 'success',
        isStatus: true,
        position: 'bottom-end',
        slots: {
            default: body
        },
    });
    useHistoryStore().addEntry({
        message: body,
        variant: 'success',
        details: path,
    });
}


export function showSaveErrorToast(err: Error|string|any, noun: string) {
    gatherStackTrace(err)
    .then((deets: string) => {
        console.error(`Error saving ${noun}:`, err);
        app_root.$showToast({
            title: `Error saving ${noun}!`,
            variant: 'danger',
            isStatus: true,
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

export function showLoadSuccessToastSimple(title: string, message: string) {
    app_root.$showToast({
        title: title,
        variant: 'success',
        position: 'bottom-end',
        isStatus: true,
        body: message,
    });
    useHistoryStore().addEntry({
        message: message,
        variant: 'success',
        details: message,
    });
}

function makeClickHandler(src: string, showOrOpen: 'open'|'show') {
    const match =  src.match(/\[(.+)\]\((.+)\)/);
    let name: string, path: string;
    if (match) {
        name = match[1];
        path = match[2];
    } else {
        name = src;
        path = src;
    }

    let clickHandler;
    if (showOrOpen === 'show') {
        clickHandler = () => shell.showItemInFolder(path);
    } else {
        clickHandler = () => shell.openPath(path);
    }

    return {name, path, clickHandler};
}

export function showLoadSuccessToast(src: string, noun: string, showOrOpen: 'open'|'show' = 'show') {

    const {name, path, clickHandler} = makeClickHandler(src, showOrOpen);

    const body = () => h('div', {}, [
                `Your ${noun} was successfully loaded from `,
                h('a', {
                    href: 'javascript:void(0);',
                    title: `Click to ${showOrOpen}`,
                    onClick: clickHandler,
                    class: 'text-light',
                }, name),
            ]);

    app_root.$showToast({
        title: `Success loading ${noun}!`,
        variant: 'success',
        isStatus: true,
        position: 'bottom-end',
        slots: {
            default: body
        },
    });
    useHistoryStore().addEntry({
        message: body,
        variant: 'success',
        details: path,
    });
}

export function showLoadErrorToast(err: Error|string|any, noun: string) {
    gatherStackTrace(err)
    .then((deets: string) => {
        console.error(`Error loading ${noun}:`, err);
        app_root.$showToast({
            title: `Error loading ${noun}!`,
            variant: 'danger',
            isStatus: true,
            position: 'bottom-end',
            body: err.toString(), 
        });
        useHistoryStore().addEntry({
            message: `Error loading ${noun}!`,
            variant: 'danger',
            details: deets,
        });
    });
}

export function showStartLoadingToast(title: string = 'Loading', message: string = 'Hang tight...') {
    return app_root.$showToast({
        id: `loading-toast-${uuidv4()}`,
        title: title,
        variant: 'info',
        isStatus: true,
        position: 'bottom-end',
        modelValue: true,
        slots: {
            default: () => h('div', {}, [
                h(BSpinner, {
                    type: 'grow',
                    small: true,
                    style: { 'margin-right': '1em' }
                }),
                message,
            ]),
        }
    });
}

function gatherStackTrace(err: Error|string): Promise<string> {
    return new Promise<string>((resolve) => {
        if (err instanceof Error) {
            mapStackTrace(err.stack, (ms) => {
                // mapped trace does not include name or message, so add those.
                ms.unshift(`${err.name}: ${err.message}`);
                resolve(ms.join('\n'));
            });
        } else {
            resolve(err);
        }
    });
}

export function showGenericSimpleToast(title: string, message: string, variant: keyof BaseColorVariant | undefined = 'info') {
    app_root.$showToast({
        title: title,
        variant: variant,
        position: 'bottom-end',
        isStatus: true,
        body: message,
    });
    useHistoryStore().addEntry({
        message: message,
        variant: variant,
        details: message,
    });
}

function waitForElement(id: string): Promise<void> {
    return new Promise(resolve => {
        if (document.getElementById(id)) {
            console.log('immediate', document.getElementById(id));
            return resolve();
        }

        const observer = new MutationObserver(mutations => {
            if (document.getElementById(id)) {
                console.log('deferred', document.getElementById(id));
                resolve();
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}