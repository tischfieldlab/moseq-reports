import { Titlebar, Color } from "custom-electron-titlebar";
import createMainMenu from "./MenuStrip";

let titlebar: any | undefined;

export function CreateTitleBar() {
    DisposeTitlebar();
    titlebar = new Titlebar({
        icon: "/img/mouse.png",
        backgroundColor: Color.fromHex("#FFFFFF"),
        menu: createMainMenu(),
        shadow: false,
    });
}

export function DisposeTitlebar() {
    if (titlebar !== undefined) {
        titlebar.dispose();
        titlebar = undefined;
    }
}

export function GetTitlebar() {
    return titlebar;
}

export function UpdateTitle(title: string) {
    if (titlebar !== undefined) {
        titlebar.updateTitle(title);
    }
}
