import { DatasetsState } from '@render/store/datasets.store';
import {useDatasetsStore} from '@store/datasets.store';
import axios, { AxiosInstance } from 'axios';
import { ipcRenderer } from 'electron';
import { Operation } from './DataLoader.types';


let api: AxiosInstance;
ipcRenderer.invoke("get-data-server-address")
    .then((address: string) => {
        if (!address) {
            throw new Error("Unable to retrieve data server address.");
        }
        console.log("Data server address received from main process:", address);
        api = axios.create({
            baseURL: address,
            // You can add other default configurations here, such as headers
        });
    })
    .catch((error: Error) => {
        console.error("Failed to retrieve data server address:", error);
    });


const DataService = {
    resolve(path: string): string {
        return `${api.defaults.baseURL}/${path}`;
    },
    async loadFile(filename: string): Promise<DatasetsState> {
        try {
            const response = await api.post('/api/load-file', { filename });
            return response.data as DatasetsState;
        } catch (error) {
            console.error("Failed to send filename to DataServer:", error);
            throw error;
        }
    },
    async fetchData<TData>(dataset_name: string, operations: Operation[], debug: boolean = false): Promise<TData> {
        const datasetsStore = useDatasetsStore();
        try {
            const response = await api.get('/load-data', {
                params: { 
                    path: datasetsStore.resolve(dataset_name),
                    operations: JSON.stringify(operations),
                    debug: debug
                },
            });
            return response.data as TData;
        } catch (error) {
            console.error("Error fetching data:", error);
            throw error;
        }
    }

};


export default DataService;
export * from './DataLoader.types';
