import { nextTick } from 'vue';
import store from '@render/store/root.store';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { dialog } from '@electron/remote';
import { LoadDefaultLayout } from './LoadLayout';
import { EventEmitter } from "@render/util/EventEmitter";
import axios from "axios";

ipcRenderer.on('ready-to-load-file', (event: IpcRendererEvent, data: string) => {
  if (data == null || data === "" || data === undefined) {
    return;
  }LoadDataFile(data);
});

export const DataFileExt = 'msq';

export default function () {
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
  return (store.state as any).datasets.isLoaded;
}

export function LoadDataFile(filename: string) {
  showStartLoadingToast();
  nextTick().then(() => beginLoadingProcess(filename));
}

async function beginLoadingProcess(filename: string) {
  try {
    const serverAddress = await ipcRenderer.invoke("get-data-server-address");

    if (!serverAddress) {
      console.error("DataServer is not running. Cannot send data.");
      hideLoadingToast();
      return;
    }
    console.log("Server address fetched:", serverAddress);
    store.dispatch('server/updateServerAddress', serverAddress);
  
  nextTick()
    .then(() => {
      //console.log("Starting data load process...");
      EventEmitter.emit("begin-dataset-load"); 
      store.commit("datasets/Unload"); 
    })
    //.then(() => readDataBundle(filename))
    //.then((data) => {
    //  console.log("Data loaded from bundle:", data);
    //  return store.dispatch("datasets/setData", data).then(() => data);
    //})
    .then(async (data) => {
      // Send the dataset to the DataServer
      try {
        const response = await axios.post(`${serverAddress}/api/load-file`, {filename});
        return response.data;
      } catch (error) {
        console.error("Failed to send filename to DataServer:", error);
        throw error;
      }
    })
    .then((data) => {
      console.log("Processed data received from DataServer:", data);
      return store.dispatch("datasets/setData", data).then(() => data);
    })
    .then(() => {
      let init;
      if ((store.state as any).filters.items.length === 0) {
        init = store.dispatch("filters/addFilter");
      } else {
        init = Promise.resolve();
      }
      return init.then(() =>
        Promise.allSettled(
          (store.state as any).filters.items.map((item) => {
            return store.dispatch(`${item}/initialize`);
          })
        )
      );
    })
    .then(async () => {
      if ((store.state as any).datawindows.items.length  === 0) {
        await nextTick();
        return LoadDefaultLayout(false);
      }
    })
    .then(() => {
      hideLoadingToast();
      const message = 'File "'+ (store.state as any).datasets.name +'" was loaded successfully.';
      showSuccessToast(message);
      store.commit("history/addEntry", { message, variant: "success" });
      EventEmitter.emit("finish-dataset-load"); // Emit the event
    })
    .catch((reason) => {
      console.error("Error during data load process:", reason);
      hideLoadingToast();
      showErrorToast(reason.toString());
      store.commit("history/addEntry", { message: reason, variant: "danger" });
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
