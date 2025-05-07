import { defineStore, acceptHMRUpdate } from 'pinia'

export enum SidebarPosition {
    Left,
    Right,
}

export interface SidebarState {
    sidebarPosition: SidebarPosition;
}

export const useSidebarStore = defineStore('sidebar', {
    state: (): SidebarState => ({
        sidebarPosition: SidebarPosition.Left,
    }),
    actions: {
        setSidebarPosition(payload: SidebarPosition) {
            this.sidebarPosition = payload;
        },
    },
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useSidebarStore, import.meta.hot))
}
