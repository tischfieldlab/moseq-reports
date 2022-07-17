import { createMainMenu } from "@main/preload/MenuStrip";
import { Titlebar, Color } from "custom-electron-titlebar";

let titlebar: any;

export function CreateTitleBar() {
  DisposeTitlebar();
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

if (import.meta.hot) {
  import.meta.hot.dispose(() => DisposeTitlebar());
}
