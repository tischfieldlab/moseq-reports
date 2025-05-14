import { nextTick } from 'vue';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { dialog } from '@electron/remote';
import { LoadDefaultLayout } from './LoadLayout';
import { EventEmitter } from "@render/util/EventEmitter";
import axios from "axios";

import {useDatasetsStore} from '@store/datasets.store'
import {useHistoryStore} from '@store/history.store'
import {useFiltersStore} from "@store/filters.store";
import {useDataViewStore} from "@store/dataview.store";
import {useWindowsStore} from "@store/windows.store";
import DataService from "@api";


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
    showStartLoadingToast();
    nextTick().then(() => beginLoadingProcess(filename));
}

async function beginLoadingProcess(filename: string) {
    const datasetStore = useDatasetsStore();
    const historyStore = useHistoryStore();
    const filtersStore = useFiltersStore();
    const windowsStore = useWindowsStore();

    try {
        nextTick()
        .then(() => {
            //console.log("Starting data load process...");
            EventEmitter.emit("begin-dataset-load"); 
            datasetStore.Unload();
        })
        //.then(() => readDataBundle(filename))
        //.then((data) => {
        //   console.log("Data loaded from bundle:", data);
        //    return store.dispatch("datasets/setData", data).then(() => data);
        //})
        .then(async (data) => {
            // Send the dataset to the DataServer
            return DataService.loadFile(filename);
        })
        .then((data) => {
            console.log("Processed data received from DataServer:", data);
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
            if (windowsStore.items.length  === 0) {
                await nextTick();
                return LoadDefaultLayout(false);
            }
        })
        .then(() => {
            hideLoadingToast();
            const message = 'File "'+ datasetStore.name +'" was loaded successfully.';
            showSuccessToast(message);
            historyStore.addEntry({ message, variant: "success" });
            EventEmitter.emit("finish-dataset-load"); // Emit the event
        })
        .catch((reason) => {
            console.error("Error during data load process:", reason);
            hideLoadingToast();
            showErrorToast(reason.toString());
            historyStore.addEntry({ message: reason, variant: "danger" });
            EventEmitter.emit("fail-dataset-load"); // Emit the event
        });
    }catch (error) {
        console.error("Error fetching server address:", error);
        hideLoadingToast();
    }
}


function showStartLoadingToast() {
    console.log('Showing loading toast...');
    // Implement your own toast logic or use a library like Vue Toastification
}

function hideLoadingToast() {
    console.log('Hiding loading toast...');
    // Implement your own toast logic or use a library like Vue Toastification
}

function showSuccessToast(message: string) {
    console.log('Showing success toast:', message);
    // Implement your own toast logic or use a library like Vue Toastification
}

function showErrorToast(message: string) {
    console.log('Showing error toast:', message);
    // Implement your own toast logic or use a library like Vue Toastification
}

/*function readDataBundle(filename: string): Promise<Partial<DatasetsState>> {
  return new Promise((resolve, reject) => {
    let zip;
    try {
      zip = new StreamZip({ file: filename, storeEntries: true });
      zip.on('error', reject);
      zip.on('ready', async () => {
        try {
          const dataset: Partial<DatasetsState> = {
            bundle: filename,
            name: path.basename(filename, `.${DataFileExt}`),
            ...await LoadMetadataData(zip),
          };
          resolve(dataset);
        } catch (e) {
          reject(e);
        } finally {
          zip.close();
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function LoadMetadataData(zip: StreamZip) {
  return {
    manifest: await jsonParseZipEntry(zip, 'manifest.json'),
    groups: await jsonParseZipEntry(zip, 'groups.json'),
    label_map: await jsonParseZipEntry(zip, 'label_map.json'),
  };
}

async function jsonParseZipEntry(zip: StreamZip, entryName: string) {
  try {
    const entry = zip.entryDataSync(entryName);
    return JSON.parse(entry.toString());
  } catch {
    throw new Error(`Entry ${entryName} is missing from data file!`);
  }
}*/
