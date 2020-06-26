import app from '@/main';
import { ipcRenderer } from 'electron';
import { UpdateCheckResult } from 'electron-updater';


ipcRenderer.on('update-check', (event: any, data: UpdateCheckResult) => {
    UpdateCheck();
    ipcRenderer.send('update-check-done');
});

export function UpdateCheck() {
    app.$root.$once('bv::toast:shown', () => beginUpdateCheck());
    showStartLoadingToast('checking for updates.', 'Update Check');
}

function beginUpdateCheck() {
    app.$forceNextTick()
        .then(() => app.$root.$emit('begin-update-check'))
        .then(() => {
            app.$bvToast.hide('update-test');
            app.$root.$emit('finished-update-check');
            app.$bvToast.toast('Check for Updates Completed', {
                title: 'Check for updates successful!',
                variant: 'success',
                toaster: 'b-toaster-bottom-right',
            });
        });
}

function showStartLoadingToast(msg: string, title: string) {
    const h = app.$createElement;

    const body = [
        h('div', {}, [
            h('b-spinner', {
                props: { type: 'grow', small: true },
                style: { 'margin-right': '1em' },
            }),
            'Hang tight... We\'re ' + msg + '.',
        ]),
    ];

    app.$bvToast.toast(body, {
        id: 'update-test',
        title,
        variant: 'info',
        toaster: 'b-toaster-bottom-right',
        noAutoHide: true,
    });
}
