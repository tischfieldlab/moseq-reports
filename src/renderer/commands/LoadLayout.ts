import fs from "fs";
import store from "@render/store/root.store";
import { dialog, shell } from "@electron/remote";
import Toastify from "toastify-js";
import path from "path";

export const LayoutFileExt = "msl";
const LayoutFileFilters = [
  { name: "MoSeq Layout Files", extensions: [LayoutFileExt] },
  { name: "All Files", extensions: ["*"] },
];
const toastId = "msl-loading-toast";

/**
 * Opens a file dialog for the user to select a layout file and loads it.
 */
export default function () {
  const filenames = dialog.showOpenDialogSync({
    properties: ["openFile"],
    filters: LayoutFileFilters,
  });
  if (filenames && filenames[0]) {
    LoadLayoutFile(filenames[0]);
  }
}

/**
 * Loads the default layout.
 * @param showNotifications - Whether to show notifications for the operation.
 */
export async function LoadDefaultLayout(showNotifications = true) {
  if (showNotifications) {
    showStartLoadingToast();
  }
  try {
    const response = await fetch(`/default_layout.${LayoutFileExt}`);
    const data = await response.json();
    await store.dispatch("datawindows/loadLayout", data);

    if (showNotifications) {
      showLoadSuccessToast("Default Layout");
    }
  } catch (error) {
    console.error("Error loading default layout:", error);
    if (showNotifications) {
      showErrorToast("Failed to load default layout.");
    }
  }
}

/**
 * Loads a layout file from the provided filename.
 * @param filename - The path to the layout file.
 * @param showNotifications - Whether to show notifications for the operation.
 */
export async function LoadLayoutFile(filename: string, showNotifications = true) {
  if (showNotifications) {
    showStartLoadingToast();
  }

  try {
    const content = await new Promise<unknown>((resolve, reject) => {
      fs.readFile(filename, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data.toString()));
        }
      });
    });

    if (Array.isArray(content)) {
      await store.dispatch("datawindows/loadLayout", content);
    } else if (typeof content === "object" && content !== null) {
      const layoutContent = content as { filters?: unknown; layout?: unknown };
      if (layoutContent.filters) {
        await store.dispatch("filters/loadFilters", layoutContent.filters);
      }
      if (layoutContent.layout) {
        await store.dispatch("datawindows/loadLayout", layoutContent.layout);
      }
    }

    if (showNotifications) {
      showLoadSuccessToast(filename);
    }
  } catch (error) {
    console.error("Error loading layout file:", error);
    if (showNotifications) {
      showErrorToast("Failed to load layout file.");
    }
  }
}

export async function SaveLayout() {
  const dest = dialog.showSaveDialogSync({
    title: "Save Layout",
    defaultPath: `layout.${LayoutFileExt}`,
    filters: LayoutFileFilters,
  });

  if (dest) {
    try {
      const layout = await store.dispatch("datawindows/serializeLayout");
      const filters = await store.dispatch("filters/serializeFilters");
      const data = { layout, filters };
      const contents = JSON.stringify(data, null, "\t");

      fs.writeFileSync(dest, contents);
      showSaveSuccessToast(dest);
    } catch (error) {
      console.error("Error saving layout:", error);
      showErrorToast("Failed to save layout.");
    }
  }
}

/**
 * Clears the current layout.
 */
export function ClearLayout() {
  store.dispatch("datawindows/clearLayout");
}

/**
 * Shows a toast for successful layout save operation.
 * @param dest - The file destination where the layout was saved.
 */
function showSaveSuccessToast(dest: string) {
  Toastify({
    text: `Your layout was saved successfully to ${dest}`,
    duration: 5000,
    gravity: "bottom",
    position: "right",
    backgroundColor: "green",
    onClick: () => shell.showItemInFolder(dest),
  }).showToast();
}

/**
 * Shows a toast for the start of a layout loading operation.
 */
function showStartLoadingToast() {
  Toastify({
    text: "Hang tight... We're getting your layout ready.",
    duration: 5000,
    gravity: "bottom",
    position: "right",
    backgroundColor: "blue",
  }).showToast();
}

/**
 * Shows a toast for successful layout load operation.
 * @param filename - The name of the loaded file.
 */
function showLoadSuccessToast(filename: string) {
  Toastify({
    text: `"${filename}" was loaded successfully.`,
    duration: 5000,
    gravity: "bottom",
    position: "right",
    backgroundColor: "green",
  }).showToast();
}

/**
 * Shows a toast for error during layout operations.
 * @param message - The error message to display.
 */
function showErrorToast(message: string) {
  Toastify({
    text: message,
    duration: 5000,
    gravity: "bottom",
    position: "right",
    backgroundColor: "red",
  }).showToast();
}
