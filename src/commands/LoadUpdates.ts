import app from '@/main';
import {ipcRenderer, IpcRendererEvent} from 'electron';

// NOTE: Only call the update when we are reloaded at startup...
ipcRenderer.on('window-has-reloaded', (event: IpcRendererEvent) => {
    // NOTE: Send the event to the main proc to start the update check
    CheckUpdates();
});

function createSpinnerToast(id: string, title: string, type: string, message: string) {
    const h = app.$createElement;

    const body = [
        h('div', {}, [
            h('b-spinner', {
                props: { type: 'grow', small: true },
                style: { 'margin-right': '1em' },
            }),
            message,
        ]),
    ];

    app.$bvToast.toast(body, {
        id: id,
        title: title,
        variant: type,
        toaster: 'b-toaster-bottom-right',
    });
}

function createToast(title: string, type: string, message: string, id: string) {
    app.$bvToast.toast(message, {
        id: id,
        title: title,
        variant: type,
        toaster: 'b-toaster-bottom-right',
    });
}

export function CheckUpdates() {
    if (process.env.NODE_ENV !== 'production') { return; }
    ipcRenderer.send('updater-start-update-check');

    createSpinnerToast('update-check-toast', 'Downloading update', 'info',
        'Hang tight... We\'re checking for updates.');
}

// NOTE: Event from the main process saying update check was completed
ipcRenderer.on('updater-finish-update-check', (event: IpcRendererEvent, version: string) => {
    app.$bvToast.hide('update-check-toast');
    if (version === '') {
        // NOTE: This means there is no update
        createToast('No new version available.', 'No new versions!', 'danger', 'update-error');
    } else if (version === 'error') {
        // NOTE: This means updating was unsuccessful... for now we just hide the toast.
        createToast('No new version available.', 'No new versions!', 'danger', 'update-error');
    } else {
        // NOTE: This means there is a new version available for download.
        // createToast('New version ' + version + ' available.', 'Update check successful!', 'success');

        const h = app.$createElement;

        const body = [
            h('div', {}, [
                h('p', {}, [
                   "Would you like to download version " + version + " ?"
                ]),
                h('b-button', {
                   on: {'click': (event: any) => {
                           createSpinnerToast('download-toast', 'Downloading update','info',
                               'Hang tight... We\'re downloading updates.');
                           // NOTE: Send back a message to start the download process.
                           app.$bvToast.hide('New version ' + version + ' available.');
                           ipcRenderer.send('updater-start-update-download');
                       }},
                    style: {'margin-right': '1em'},
                    props: { variant: 'primary'}
                }, [
                    "Download",
                ]),
                h('b-button', {
                    on: {'click': (event: any) => { app.$bvToast.hide('New version ' + version + ' available.')}},
                    props: { variant: 'danger'}
                }, [
                    "Not now",
                ])
            ]),
        ];

        app.$bvToast.toast(body, {
            id: 'New version ' + version + ' available.',
            title: 'Update check successful.',
            variant: 'info',
            toaster: 'b-toaster-bottom-right',
            noAutoHide: true,
        });
    }
});

// NOTE: This is sent to us from the main proc when the update is downloaded and ready to be installed
ipcRenderer.on('updater-finish-update-download', (event: IpcRendererEvent, result: string) => {
    app.$bvToast.hide('download-toast');
    if (result === 'success') {
        createToast('Update download successful!', 'success', 'Successfully downloaded updates.',
            'download-succeeded');

        const h = app.$createElement;

        const body = [
            h('div', {}, [
                h('p', {}, [
                    "Would you like to install the update now, or on next launch?"
                ]),
                h('b-button', {
                    on: {'click': (event: any) => {
                            // NOTE: Send message to main process to install the update and restart
                            app.$bvToast.hide('Ready to install update.');
                            ipcRenderer.send('updater-restart-and-install-now');
                        }
                    },
                    style: {'margin-right': '1em'},
                    props: { variant: 'primary'}
                }, [
                    "Now",
                ]),
                h('b-button', {
                    on: {'click': (event: any) => {
                            app.$bvToast.hide('Ready to install update.');
                            // NOTE: Send message to install on next launch
                            ipcRenderer.send('updater-restart-and-install-later');
                        }
                    },
                    props: { variant: 'secondary'}
                }, [
                    "Next Launch",
                ])
            ]),
        ];

        app.$bvToast.hide('download-succeeded');
        app.$bvToast.toast(body, {
            id: 'Ready to install update.',
            title: 'Ready to install update.',
            variant: 'info',
            toaster: 'b-toaster-bottom-right',
            noAutoHide: true,
        });
    } else {
        createToast('Update download failed!', 'danger', result, 'download-error');
    }
});
