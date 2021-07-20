import fs from 'fs';
import store from '@/store/root.store';
import { remote, shell } from 'electron';
import app from '@/main';


export const LayoutFileExt = 'msl';
const LayoutFileFilters = [
    { name: 'MoSeq Layout Files', extensions: [LayoutFileExt] },
    { name: 'All Files', extensions: ['*'] },
];
const toastId = 'msl-loading-toast';

export default function() {
    const filenames = remote.dialog.showOpenDialogSync({
        properties: ['openFile'],
        filters: LayoutFileFilters,
    });
    if (filenames === undefined) {
        return;
    }

    LoadLayoutFile(filenames[0]);
}

export function LoadDefaultLayout(showNotifications= true) {
    let chain;
    if (showNotifications) {
        chain = new Promise<void>((resolve) => {
            app.$root.$once('bv::toast:shown', () => resolve());
            showStartLoadingToast();
        });
    } else {
        chain = Promise.resolve();
    }
    chain = chain.then(() => fetch(`/default_layout.${LayoutFileExt}`))
    .then((response: Response) => {
        return response.json();
    })
    .then((data) => {
        store.dispatch('datawindows/loadLayout', data);
    });
    if (showNotifications) {
        chain = chain.then(() => {
            app.$bvToast.hide(toastId);
            showLoadSuccessToast('Default Layout');
        });
    }
    return chain;
}

export async function LoadLayoutFile(filename: string, showNotifications= true) {
    let chain;
    if (showNotifications) {
        chain = new Promise<void>((resolve) => {
            app.$root.$once('bv::toast:shown', () => resolve());
            showStartLoadingToast();
        });
    } else {
        chain = Promise.resolve();
    }
    chain = chain.then(() => {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err !== null) {
                    reject(err);
                }
                resolve(JSON.parse(data.toString()));
            });
        });
    })
    .then(async (content) => {
        if (Array.isArray(content)) {
            // old style, list of window layouts
            store.dispatch('datawindows/loadLayout', content);
            return;
        }
        content = content as {filters: any, layout: any};
        if (content.hasOwnProperty('filters')) {
            await store.dispatch('filters/loadFilters', content.filters);
        }
        if (content.hasOwnProperty('layout')) {
            await store.dispatch('datawindows/loadLayout', content.layout);
        }
    });
    if (showNotifications) {
        chain = chain.then(() => {
            app.$bvToast.hide(toastId);
            showLoadSuccessToast(filename);
        });
    }
}

export async function SaveLayout() {
    const dest = remote.dialog.showSaveDialogSync({
        title: 'Save Layout',
        defaultPath: `layout.${LayoutFileExt}`,
        filters: LayoutFileFilters,
    });

    if (dest !== undefined) {
        const layout = await store.dispatch('datawindows/serializeLayout');
        const filters = await store.dispatch('filters/serializeFilters');
        const data = {
            layout,
            filters,
        };
        const contents = JSON.stringify(data, null, '\t');

        fs.writeFileSync(dest, contents);
        showSaveSuccessToast(dest);
    }
}

export function ClearLayout() {
    store.dispatch('datawindows/clearLayout');
}


function showSaveSuccessToast(dest: string, showOrOpen: 'open'|'show' = 'show') {
    const h = app.$createElement;

    let clickHandler;
    if (showOrOpen === 'show') {
        clickHandler = () => shell.showItemInFolder(dest);
    } else {
        clickHandler = () => shell.openPath(dest);
    }

    const body = [
        h('div', {}, [
            'Your layout was saved successfully to ',
            h('a', {
                attrs: { href: 'javascript:void(0)', title: 'Click to open' },
                on: { click: clickHandler },
            }, dest),
        ]),
    ];

    app.$bvToast.toast(body, {
        title: 'Layout Saved!',
        variant: 'success',
        toaster: 'b-toaster-bottom-right',
    });
}

function showStartLoadingToast() {
    const h = app.$createElement;

    const body = [
        h('div', {}, [
            h('b-spinner', {
                props: { type: 'grow', small: true },
                style: { 'margin-right': '1em' },
            }),
            'Hang tight... We\'re getting your layout ready.',
        ]),
    ];

    app.$bvToast.toast(body, {
        id: toastId,
        title: 'Loading Layout',
        variant: 'info',
        toaster: 'b-toaster-bottom-right',
        // noAutoHide: true,
    });
}

function showLoadSuccessToast(filename) {
    app.$bvToast.toast(`"${filename}" was loaded successfully.`, {
        title: 'Layout loaded successfully!',
        variant: 'success',
        toaster: 'b-toaster-bottom-right',
    });
}
