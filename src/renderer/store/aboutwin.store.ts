import { defineStore, acceptHMRUpdate } from 'pinia'


export interface AboutWindowState {
    show: boolean; // Whether the about window is visible
}

export const useAboutWindowStore = defineStore('aboutWindow', {
    state: (): AboutWindowState => ({
        show: false,
    }),
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAboutWindowStore, import.meta.hot))
}
