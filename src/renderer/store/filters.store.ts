import { defineStore, acceptHMRUpdate } from 'pinia'

import { useDataViewStore } from './dataview.store'
import {useDataWindowStore} from './datawindow.store'

interface FiltersState {
  basename: string;
  items: string[];
}
import { useWindowsStore } from './windows.store'
import { DataviewPayload, DataViewRecord } from './dataview.types';



export const useFiltersStore = defineStore("filters", {
    state: (): FiltersState => {
        return {
            basename: "dataview",
            items: [],
        };
    },
    getters: {
        default(state) {
            return state.items[0];
        },
    },
    actions: {
        async serializeFilters() {
            try {
                const dehydrated = this.items.map(async (id) => {
                    return [
                        id,
                        await useDataViewStore(id).serialize()
                    ] as [string, DataViewRecord];
                });
                return Object.fromEntries(await Promise.all(dehydrated));
            } catch (error) {
                console.error("Error serializing filters:", error);
                throw error;
            }
        },
        async loadFilters(filters: Record<string, DataViewRecord>) {
            try {
                const existing = this.items;
                const imported: string[] = [];

                for (const [name, filter] of Object.entries(filters)) {
                    imported.push(name);

                    if (existing.includes(name)) {
                        await useDataViewStore(name).load(filter as DataViewRecord);
                    } else {
                        const store = useDataViewStore(name);
                        await store.initialize();
                        await store.load(filter as DataViewRecord);
                        this.items.push(name);
                    }
                }

                existing
                    .filter((ns) => !imported.includes(ns))
                    .forEach((id) => this.removeFilter(id));
            } catch (error) {
                console.error("Error loading filters:", error);
            }
        },
        async addFilter() {
            try {
                let i = 0;
                while (true) {
                    const name = `${i}`;
                    if (!this.items.includes(name)) {
                        const store = useDataViewStore(name);
                        await store.initialize();
                        this.items.push(name);
                        return name;
                    }
                    i++;
                }
            } catch (error) {
                console.error("Error adding filter:", error);
                throw error;
            }
        },
        removeFilter(namespace: string) {
            const windowsStore = useWindowsStore();
            try {
                const start = this.items.indexOf(namespace);
                if (start !== -1) {
                    this.items.splice(start, 1);
                }
        
                const winsUsingFilter = windowsStore.windowsUsingDataView(namespace)
                for (const win of winsUsingFilter) {
                    const winStore = useDataWindowStore(win);
                    winStore.updateComponentDataSource({ source: this.default });
                }
        
                useDataViewStore(namespace).$dispose();
            } catch (error) {
                console.error("Error removing filter:", error);
            }
        },
    }
});

