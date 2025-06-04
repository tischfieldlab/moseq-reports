import fs from "fs";
import { dialog, shell } from "@electron/remote";
import { DehydratedDataWindow } from "@store/datawindow.types";
import { useWindowsStore } from "@store/windows.store"
import { useFiltersStore } from "@store/filters.store";
import { DataViewRecord } from "@render/store/dataview.types";
import { showGenericSimpleToast, showLoadErrorToast, showLoadSuccessToast, showLoadSuccessToastSimple, showSaveErrorToast, showSaveSuccessToast, showStartLoadingToast } from "@render/components/Core/IO/Toasts";





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
    const windowsStore = useWindowsStore();
    let loading_toast;
    if (showNotifications) {
        loading_toast = showStartLoadingToast("Loading Layout", 'Hang tight... We\'re getting your layout ready.');
    }
    try {
        const response = await fetch(`/default_layout.${LayoutFileExt}`);
        const data = await response.json();
        await windowsStore.loadLayout(data);

        if (showNotifications) {
            loading_toast.destroy();
            showLoadSuccessToastSimple('Layout loaded successfully!', "Default layout was loaded successfully.");
        }
    } catch (error) {
        if (showNotifications) {
            loading_toast.destroy();
            showLoadErrorToast(error, "default layout.");
        }
    }
}

/**
 * Loads a layout file from the provided filename.
 * @param filename - The path to the layout file.
 * @param showNotifications - Whether to show notifications for the operation.
 */
export async function LoadLayoutFile(filename: string, showNotifications = true) {
    let loading_toast;
    if (showNotifications) {
        loading_toast = showStartLoadingToast("Loading Layout", 'Hang tight... We\'re getting your layout ready.');
    }

    const windowsStore = useWindowsStore();
    const filtersStore = useFiltersStore();

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
            await windowsStore.loadLayout(content);
        } else if (typeof content === "object" && content !== null) {
            const layoutContent = content as { filters?: Record<string, DataViewRecord>; layout?: DehydratedDataWindow[] };
            if (layoutContent.filters) {
                await filtersStore.loadFilters(layoutContent.filters);
            }
            if (layoutContent.layout) {
                await windowsStore.loadLayout(layoutContent.layout);
            }
        }

        if (showNotifications) {
            loading_toast.destroy();
            showLoadSuccessToast(filename, "layout");
        }
    } catch (error) {
        if (showNotifications) {
            loading_toast.destroy();
            showLoadErrorToast(error, "layout file");
        }
    }
}

export async function SaveLayout() {
    const windowsStore = useWindowsStore();
    const filtersStore = useFiltersStore();
    const dest = dialog.showSaveDialogSync({
        title: "Save Layout",
        defaultPath: `layout.${LayoutFileExt}`,
        filters: LayoutFileFilters,
    });

    if (dest) {
        try {
            const layout = await windowsStore.serializeLayout();
            const filters = await filtersStore.serializeFilters();
            const data = { layout, filters };
            const contents = JSON.stringify(data, null, "\t");

            fs.writeFileSync(dest, contents);
            showSaveSuccessToast(dest, 'layout');
        } catch (error) {
            console.error("Error saving layout:", error);
            showSaveErrorToast(error, "layout");
        }
    }
}

/**
 * Clears the current layout.
 */
export function ClearLayout() {
    const windowsStore = useWindowsStore();
    windowsStore.clearLayout();
    showGenericSimpleToast("Layout cleared", "The current layout has been cleared.");
}


