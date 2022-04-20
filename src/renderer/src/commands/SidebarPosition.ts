import store from "../store/root.store";
import { SidebarPosition } from "../store/root.types";

export function SetSidebarRight() {
    store.commit("setSidebarPosition", SidebarPosition.Right);
}
export function SetSidebarLeft() {
    store.commit("setSidebarPosition", SidebarPosition.Left);
}
export function CurrentSidebarPosition() {
    return store.state.sidebarPosition;
}
export function isSidebarLeft() {
    return store.state.sidebarPosition === SidebarPosition.Left;
}
export function isSidebarRight() {
    return store.state.sidebarPosition === SidebarPosition.Right;
}
