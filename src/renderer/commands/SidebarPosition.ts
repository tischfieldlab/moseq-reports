import { useStore } from "vuex";
import { SidebarPosition } from "@render/store/root.types";

export function useSidebar() {
  const store = useStore();

  const setSidebarRight = () => {
    store.commit("setSidebarPosition", SidebarPosition.Right);
  };

  const setSidebarLeft = () => {
    store.commit("setSidebarPosition", SidebarPosition.Left);
  };

  const getCurrentSidebarPosition = () => {
    return store.state.sidebarPosition;
  };

  const isSidebarLeft = () => {
    return store.state.sidebarPosition === SidebarPosition.Left;
  };

  const isSidebarRight = () => {
    return store.state.sidebarPosition === SidebarPosition.Right;
  };

  return {
    setSidebarRight,
    setSidebarLeft,
    getCurrentSidebarPosition,
    isSidebarLeft,
    isSidebarRight,
  };
}
