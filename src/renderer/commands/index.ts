

import { IMenuAPI, IMenuAPIRenderer, MenuComponentRegistration } from "@main/shared/menuAPI";
import LoadData from "./LoadData";
import CreateComponent from "./CreateComponent";
import { SnapshotWorkspace } from "@render/components/Core/SnapshotHelper";
import { SetSidebarLeft, SetSidebarRight } from "./SidebarPosition";
import LoadLayout, { ClearLayout, LoadDefaultLayout, SaveLayout } from "./LoadLayout";
import showAboutWindow from "./ShowAbout";

const MenuBridge: IMenuAPIRenderer = {
    openData: () => LoadData(),
    createComponent: (componentType: MenuComponentRegistration) => CreateComponent(componentType),
    snapshotWorkspace: () => SnapshotWorkspace(),
    setSidebarPosition: (position: "left" | "right") => {
        if (position === "left") {
            SetSidebarLeft();
        } else if (position === "right") {
            SetSidebarRight();
        } else {
            console.error("Invalid sidebar position. Use 'left' or 'right'.");
            return;
        }
    },
    saveLayout: () => SaveLayout(),
    loadLayout: () => LoadLayout(),
    loadDefaultLayout: () => LoadDefaultLayout(),
    clearLayout: () => ClearLayout(),
    showAboutWindow: () => showAboutWindow(),
}
if (!window.menuAPI) {
    window.menuAPI = {} as IMenuAPI;
}
window.menuAPI.renderer = MenuBridge;