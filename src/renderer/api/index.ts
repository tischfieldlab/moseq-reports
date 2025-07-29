import { DatasetsState } from '@render/store/datasets.store';
import {useDatasetsStore} from '@store/datasets.store';
import axios, { AxiosInstance } from 'axios';
import { ipcRenderer } from 'electron';
import { Operation } from './DataLoader.types';
import { add } from 'date-fns';

let current_token: string | null = null;
let api: AxiosInstance;
ipcRenderer.invoke("get-data-server-address")
    .then((address: string) => {
        if (!address) {
            throw new Error("Unable to retrieve data server address.");
        }
        console.log("Data server address received from main process:", address);
        api = axios.create({
            baseURL: address,
        });
        axios.interceptors.request.use((config) => {
            if (current_token) {
                config.params = {...config.params, token: current_token};
            }
            return config;
        });
    })
    .catch((error: Error) => {
        console.error("Failed to retrieve data server address:", error);
    });



const DataService = {
    resolveWithToken(path: string): string {
        if (!current_token) {
            throw new Error("No token available. Please load a file first.");
        }
        const url = new URL(path, api.defaults.baseURL); // Validate the URL
        url.searchParams.set('token', current_token);
        return url.toString();
    },
    resolve(path: string): string {
        const url = new URL(path, api.defaults.baseURL); // Validate the URL
        return url.toString();
    },
    addToken(url: string): string {
        if (!current_token) {
            throw new Error("No token available. Please load a file first.");
        }
        const urlObj = new URL(url, api.defaults.baseURL);
        urlObj.searchParams.set('token', current_token);
        return urlObj.toString();
    },
    async loadFile(filename: string): Promise<DatasetsState> {
        try {
            const response = await api.post('/api/load-file', { filename });
            current_token = response.data.token;
            return response.data.data as DatasetsState;
        } catch (error) {
            console.error("Failed to send filename to DataServer:", error);
            throw error;
        }
    },
    async unloadFile(): Promise<void> {
        try {
            const response = await api.post('/api/unload-file');
            current_token = null; // Clear the token after unloading
            if (response.status !== 200) {
                throw new Error("Failed to unload file from DataServer.");
            }
        } catch (error) {
            console.error("Failed to unload file from DataServer:", error);
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
                    debug: debug,
                    token: current_token, // Include the current token in the request
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
