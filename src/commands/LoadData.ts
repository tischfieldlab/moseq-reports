import app from '@/main';
import LoadDataBundle from '@/models/DataLoader';
import store from '@/store/root.store';



export default function(filename: string) {
    // Once the toast that we are loading data is actually shown,
    // then actualy go ahead and load the data. Otherwise the toast
    // animation and loading will race and frequently the loading
    // notification will fail to show until after data is loaded.
    app.$root.$once('bv::toast:shown', () => actuallyLoadData(filename));
    showStartLoadingToast();
}

function actuallyLoadData(filename: string) {
    app.$forceNextTick()
        .then(() => LoadDataBundle(filename))
        .catch((reason) => {
            app.$bvToast.toast(reason, {
                title: 'Error loading data!',
                variant: 'danger',
                toaster: 'b-toaster-bottom-right',
            });
        }).then(() => {
            app.$bvToast.toast('File "' + (store.state as any).datasets.name + '" was loaded successfully.', {
                title: 'Data loaded successfully!',
                variant: 'success',
                toaster: 'b-toaster-bottom-right',
            });
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
            'Hang tight... We\'re getting your data ready.',
        ]),
    ];

    app.$bvToast.toast(body, {
        title: 'Loading Data',
        variant: 'info',
        toaster: 'b-toaster-bottom-right',
        // noAutoHide: true,
    });
}
