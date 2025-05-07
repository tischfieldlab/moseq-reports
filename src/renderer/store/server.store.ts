import { defineStore, acceptHMRUpdate } from 'pinia'

export interface ServerState {
    serverAddress: string | null;
}

export const useServerStore = defineStore('server', {
    state: (): ServerState => ({
        serverAddress: null,
    }),
    actions: {
        setServerAddress(address: string) {
            this.serverAddress = address;
        },
    },
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useServerStore, import.meta.hot))
}
