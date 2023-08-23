import app from "@render/index";
import { shell } from "electron";
import { mapStackTrace } from "sourcemapped-stacktrace";

export function showSaveSuccessToast(dest: string, noun: string, showOrOpen: "open" | "show" = "open") {
  const h = app.$createElement;

  let clickHandler;
  if (showOrOpen === "show") {
    clickHandler = () => shell.showItemInFolder(dest);
  } else {
    clickHandler = () => shell.openPath(dest);
  }

  const body = [
    h("div", {}, [
      `Your ${noun} was saved successfully to `,
      h(
        "a",
        {
          attrs: {
            href: "javascript:void(0);",
            title: `Click to ${showOrOpen}`,
          },
          on: {
            click: clickHandler,
          },
        },
        dest
      ),
    ]),
  ];

  app.$bvToast.toast(body, {
    title: `Success saving ${noun}!`,
    variant: "success",
    toaster: "b-toaster-bottom-right",
  });
  app.$store.commit("history/addEntry", { message: body, variant: "success" });
}

export function showSaveErrorToast(err: Error | string, noun: string) {
  new Promise((resolve) => {
    if (err instanceof Error) {
      mapStackTrace(err.stack, (ms) => {
        // mapped trace does not include name or message, so add those.
        ms.unshift(`${err.name}: ${err.message}`);
        resolve(ms.join("\n"));
      });
    } else {
      resolve(undefined);
    }
  }).then((deets) => {
    app.$bvToast.toast(err.toString(), {
      title: `Error saving ${noun}!`,
      variant: "danger",
      toaster: "b-toaster-bottom-right",
    });
    app.$store.commit("history/addEntry", {
      message: `Error saving ${noun}!`,
      variant: "danger",
      details: deets,
    });
  });
}
