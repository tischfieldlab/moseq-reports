
export interface ComponentRegistration {
    friendly_name: string;
    component_type: string;
}

export enum MenuEvents {
    OPEN_DATA = "open-data",
    CREATE_COMPONENT = "create-component",
    SNAPSHOT_WORKSPACE = "snapshot-workspace",
    ABOUT_WINDOW = "about-window",
}

export interface IMenuAPI {
    setBaseTitle: (title: string) => void,
    setLoadedFilename: (filename: string) => void,
    addComponentRegistration: (component: ComponentRegistration) => void,
}