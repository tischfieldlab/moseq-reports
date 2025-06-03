import { nextTick, h } from 'vue';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { dialog } from '@electron/remote';
import { LoadDefaultLayout } from './LoadLayout';
import { EventEmitter } from "@render/util/EventEmitter";

import { useDatasetsStore } from '@store/datasets.store'
import { useHistoryStore } from '@store/history.store'
import { useFiltersStore } from "@store/filters.store";
import { useDataViewStore } from "@store/dataview.store";
import { useWindowsStore } from "@store/windows.store";
import DataService from "@api";
import { app_root } from '..';
import { BSpinner } from 'bootstrap-vue-next';



ipcRenderer.on('ready-to-load-file', (event: IpcRendererEvent) => {
    LoadData();
});

export const DataFileExt = 'msq';

export default function LoadData() {
    const filenames = dialog.showOpenDialogSync({
        properties: ['openFile'],
        filters: [
            { name: 'MoSeq Data Files', extensions: [DataFileExt] },
            { name: 'All Files', extensions: ['*'] },
        ],
    });
    if (filenames && filenames[0]) {
        LoadDataFile(filenames[0]);
    }
}

export function IsDataLoaded() {
    const datasetStore = useDatasetsStore();
    return datasetStore.isLoaded;
}

export function LoadDataFile(filename: string) {
    nextTick().then(() => beginLoadingProcess(filename));
}

async function beginLoadingProcess(filename: string) {
    const datasetStore = useDatasetsStore();
    const historyStore = useHistoryStore();
    const filtersStore = useFiltersStore();
    const windowsStore = useWindowsStore();

    const loading_toast = showStartLoadingToast();

    nextTick()
        .then(() => {
            EventEmitter.emit("begin-dataset-load");
            datasetStore.Unload();
        })
        .then(async (data) => {
            // Send the dataset to the DataServer
            return DataService.loadFile(filename);
        })
        .then((data) => {
            // let preload know that the dataset is loaded, and the new name of the dataset
            window.menuAPI.preload.setLoadedFilename(data.name);
            datasetStore.setData(data)
            return data;
        })
        .then(() => {
            let init;
            if (filtersStore.items.length === 0) {
                init = filtersStore.addFilter();
            } else {
                init = Promise.resolve();
            }
            return init.then(() =>
                Promise.allSettled(
                    filtersStore.items.map((item) => {
                        return useDataViewStore(item).initialize();
                    })
                )
            );
        })
        .then(async () => {
            if (windowsStore.items.length === 0) {
                await nextTick();
                return LoadDefaultLayout(false);
            }
        })
        .then(() => {
            // destroy the loading toast
            loading_toast.hide();

            // message to show in the toast and in the history
            const message = 'File "' + datasetStore.name + '" was loaded successfully.';

            // show success toast
            app_root.$showToast({
                title: 'Data loaded successfully!',
                variant: 'success',
                isStatus: true,
                position: 'bottom-end',
                body: message,
                modelValue: 5000,
            });

            // add an entry to the history store
            historyStore.addEntry({ message, variant: "success" });

            // emit an event to notify that the dataset has been loaded
            EventEmitter.emit("finish-dataset-load");
        })
        .catch((reason) => {
            console.error("Error during data load process:", reason);

            // destroy the loading toast
            loading_toast.destroy();

            // show error toast
            app_root.$showToast({
                title: 'Error loading data!',
                variant: 'danger',
                isStatus: true,
                position: 'bottom-end',
                body: reason.toString(),
                modelValue: 5000,
            });

            // add an entry to the history store
            historyStore.addEntry({ message: reason.toString(), variant: "danger" });

            // emit an event to notify that the dataset failed to load
            EventEmitter.emit("fail-dataset-load");
        });
}



function showStartLoadingToast() {
    return app_root.$showToast({
        id: 'loading-toast',
        title: 'Loading Data',
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
                'Hang tight... We\'re getting your data ready.',
            ]),
        }
    });
}

