
export interface MenuComponentRegistration {
    friendly_name: string;
    component_type: string;
}

/*
export enum MenuEvents {
    OPEN_DATA = "open-data",
    CREATE_COMPONENT = "create-component",
    SNAPSHOT_WORKSPACE = "snapshot-workspace",
    ABOUT_WINDOW = "about-window",
}
*/

export interface IMenuAPIPreload {
    setBaseTitle: (title: string) => void,
    setLoadedFilename: (filename: string) => void,
    addComponentRegistration: (component: MenuComponentRegistration) => void,
    updateSidebarPosition: (position: "left" | "right") => void,
}
export interface IMenuAPIRenderer {
    openData: () => void,
    createComponent: (componentType: MenuComponentRegistration) => void,
    snapshotWorkspace: () => void,
    setSidebarPosition: (position: "left" | "right") => void,
    saveLayout: () => void,
    loadLayout: () => void,
    loadDefaultLayout: () => void,
    clearLayout: () => void,
}
export interface IMenuAPI {
    preload: IMenuAPIPreload;
    renderer: IMenuAPIRenderer;
}