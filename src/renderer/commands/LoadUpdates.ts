import { ipcRenderer, IpcRendererEvent } from "electron";
import Toastify from "toastify-js";

// NOTE: Only call the update when we are reloaded at startup
ipcRenderer.on("window-has-reloaded", (event: IpcRendererEvent) => {
  // Defer update check for 30 seconds
  window.setTimeout(CheckUpdates, 30 * 1000);
});

/**
 * Displays a spinner toast for a long-running operation.
 */
function createSpinnerToast(id: string, title: string, type: string, message: string) {
  Toastify({
    text: `${title}: ${message}`,
    duration: -1, // Persist until manually hidden
    gravity: "bottom",
    position: "right",
    backgroundColor: type === "info" ? "blue" : "gray",
    className: id,
  }).showToast();
}

/**
 * Displays a simple toast for notifications.
 */
function createToast(id: string, title: string, type: string, message: string) {
  Toastify({
    text: `${title}: ${message}`,
    duration: 5000,
    gravity: "bottom",
    position: "right",
    backgroundColor: type === "success" ? "green" : type === "danger" ? "red" : "blue",
    className: id,
  }).showToast();
}

/**
 * Simulates pushing an event into a history log.
 */
function pushHistory(variant: string, message: string) {
  console.log(`[History] (${variant}): ${message}`); // Replace this with actual history storage logic if needed
}

/**
 * Starts the update check.
 */
export function CheckUpdates() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Update checks are skipped in development mode.");
    return;
  }
  ipcRenderer.send("updater-start-update-check");

  createSpinnerToast("update-check-toast", "Searching for Updates", "info", "Checking for updates...");
}

// NOTE: Event from the main process saying update check was completed
ipcRenderer.on("updater-finish-update-check", (event: IpcRendererEvent, version: string) => {
  Toastify({ className: "update-check-toast" }).hideToast(); // Hide spinner toast

  if (version === "") {
    createToast("update-error", "No Update Available", "success", "No new versions are available.");
    pushHistory("success", "Updater: No new versions available.");
  } else if (version === "error") {
    createToast("update-error", "Error Checking Updates", "danger", "An error occurred during update checking.");
    pushHistory("danger", "Updater: Update check failed.");
  } else {
    const downloadMessage = `Would you like to download version ${version}?`;
    createUpdateToast(version, downloadMessage);
  }
});

/**
 * Creates a toast for update availability with options to download or skip.
 */
function createUpdateToast(version: string, message: string) {
  Toastify({
    text: `${message} [Download | Skip]`,
    duration: -1, // Persist until action is taken
    gravity: "bottom",
    position: "right",
    backgroundColor: "orange",
    className: "update-available-toast",
    callback: () => {
      console.log(`Toast clicked for version ${version}.`); // Add click handling logic
    },
  }).showToast();

  // Example logic for handling the download button (adjust as needed)
  const downloadButton = document.querySelector(".update-available-toast .download");
  const skipButton = document.querySelector(".update-available-toast .skip");

  if (downloadButton) {
    downloadButton.addEventListener("click", () => {
      createSpinnerToast("download-toast", "Downloading update", "info", "Hang tight, downloading...");
      ipcRenderer.send("updater-start-update-download");
    });
  }

  if (skipButton) {
    skipButton.addEventListener("click", () => {
      Toastify({ className: "update-available-toast" }).hideToast();
    });
  }
}

// NOTE: Event from the main process when the update download is complete
ipcRenderer.on("updater-finish-update-download", (event: IpcRendererEvent, result: string) => {
  Toastify({ className: "download-toast" }).hideToast(); // Hide spinner toast

  if (result === "success") {
    createToast("download-succeeded", "Update Downloaded", "success", "The update was downloaded successfully.");
    createInstallUpdateToast();
  } else {
    createToast("download-error", "Update Download Failed", "danger", result);
    pushHistory("danger", "Updater: Update download failed.");
  }
});

/**
 * Creates a toast to prompt the user to install the downloaded update.
 */
function createInstallUpdateToast() {
  const installMessage = "Would you like to install the update now, or on the next launch?";
  Toastify({
    text: `${installMessage} [Now | Next Launch]`,
    duration: -1, // Persist until action is taken
    gravity: "bottom",
    position: "right",
    backgroundColor: "green",
    className: "install-update-toast",
  }).showToast();

  const nowButton = document.querySelector(".install-update-toast .now");
  const laterButton = document.querySelector(".install-update-toast .later");

  if (nowButton) {
    nowButton.addEventListener("click", () => {
      ipcRenderer.send("updater-restart-and-install-now");
      Toastify({ className: "install-update-toast" }).hideToast();
    });
  }

  if (laterButton) {
    laterButton.addEventListener("click", () => {
      ipcRenderer.send("updater-restart-and-install-later");
      Toastify({ className: "install-update-toast" }).hideToast();
    });
  }
}
