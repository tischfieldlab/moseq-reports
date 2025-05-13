import {useSidebarStore, SidebarPosition} from '@store/sidebar.store';



export function SetSidebarRight() {
    const sidebarStore = useSidebarStore();
    sidebarStore.setSidebarPosition(SidebarPosition.Right);
}
export function SetSidebarLeft() {
    const sidebarStore = useSidebarStore();
    sidebarStore.setSidebarPosition(SidebarPosition.Left);
}
export function CurrentSidebarPosition() {
    const sidebarStore = useSidebarStore();
    return sidebarStore.sidebarPosition;
}
export function isSidebarLeft() {
    const sidebarStore = useSidebarStore();
    return sidebarStore.sidebarPosition === SidebarPosition.Left;
}
export function isSidebarRight() {
    const sidebarStore = useSidebarStore();
    return sidebarStore.sidebarPosition === SidebarPosition.Right;
}