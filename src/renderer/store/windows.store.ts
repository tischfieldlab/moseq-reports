import { Module } from "vuex";
import { RootState, ComponentRegistration } from "@render/store/root.types";
import { DehydratedDataWindow, DataWindowState } from "@render/store/datawindow.types";
import store from "@render/store/root.store";
import { getModuleNamespace, unnest } from "@render/util/Vuex";
import DataWindowModule from "@render/store/datawindow.store";
import { clone } from "@render/util/Object";
import { WindowsState } from "@render/store/windows.types";

const WindowsModule: Module<WindowsState, RootState> = {
  namespaced: true,
  state() {
    return {
      basename: "datawindow",
      items: [],
    };
  },
  getters: {
    windowsUsingDataView: (state, getters, rootState) => (dataView) => {
      return state.items.filter((wNamespace) => {
        return unnest(rootState, wNamespace).datasource === dataView;
      });
    },
    windowsMaxZIndex: (state, getters, rootState): number => {
      let maxZIndex: number = 0;
      state.items.forEach((item: string) => {
        const winState: DataWindowState = state[item.split("/")[1]];
        if (winState.z_index > maxZIndex) {
          maxZIndex = winState.z_index;
        }
      });

      return maxZIndex;
    },
    numberOfWindows(state) {
      return state.items.length;
    },
  },
  mutations: {
    addWindow(state, namespace: string) {
      state.items.push(namespace);
    },
    removeWindow(state, namespace: string) {
      const start = state.items.indexOf(namespace);
      state.items.splice(start, 1);
    },
    clearWindows(state) {
      state.items = [];
    },
  },
  actions: {
    createWindow(context, component: ComponentRegistration) {
      const ws = createDataWindow(component);
      context.dispatch("commitWindow", ws);
    },
    hydrateWindow(context, data: DehydratedDataWindow) {
      const ws = hydrateWindow(data);
      context.dispatch("commitWindow", ws);
    },
    commitWindow(context, windowState: DataWindowState) {
      const namespace = getModuleNamespace(store, context.state) as string;
      let i = 0;
      while (true) {
        const name = `${context.state.basename}-${i}`;
        if (store.state[namespace][name] === undefined) {
          const fullpath = `${namespace}/${name}`;
          store.registerModule([namespace, name], DataWindowModule, {});
          context.commit(`${fullpath}/replaceState`, windowState, {
            root: true,
          });
          context.commit("addWindow", fullpath);
          return fullpath;
        }
        i++;
      }
    },
    removeWindow(context, namespace: string) {
      context.commit("removeWindow", namespace);
      store.unregisterModule(namespace.split("/"));
    },
    duplicateWindow(context, namespace: string) {
      // grab a copy of the window state
      const winstate = dehydrateWindow(unnest(context.rootState, namespace));
      // Prefix the window title to differentiate
      winstate.title = "Copy of " + winstate.title;
      // shift the window position a bit in x and y
      winstate.layout.position.x += 30;
      winstate.layout.position.y += 30;
      // add the modified window back into the windows store
      context.dispatch("hydrateWindow", winstate);
    },
    clearLayout(context) {
      const namespaces = [...context.state.items];
      context.commit("clearWindows");
      for (const namespace of namespaces) {
        store.unregisterModule(namespace.split("/"));
      }
    },
    serializeLayout(context): DehydratedDataWindow[] {
      const dehydrated = context.state.items.map((id) => {
        return dehydrateWindow(unnest(context.rootState, id));
      });
      return dehydrated;
    },
    async loadLayout(context, layout: DehydratedDataWindow[]) {
      // clear out any existing windows
      await context.dispatch("clearLayout");

      for (const dh of layout) {
        context.dispatch("hydrateWindow", dh);
      }
    },
  },
};
export default WindowsModule;

function createDataWindow(component: ComponentRegistration): DataWindowState {
  return {
    type: component.component_type,
    title: component.friendly_name,
    width: component.init_width || 200,
    height: component.init_height || 300,
    pos_x: 250,
    pos_y: 10,
    z_index: store.getters["datawindows/windowsMaxZIndex"],
    datasource: store.getters["filters/default"],
    render_mode: component.default_render_mode,
    aspect_ratio: component.aspect_ratio,
    settings: clone(component.default_settings || {}), // deep clone
    is_hidden: component.is_hidden || false,
  } as DataWindowState;
}

function dehydrateWindow(window: DataWindowState): DehydratedDataWindow {
  const dehydrated = {
    type: window.type,
    title: window.title,
    layout: {
      width: window.width,
      height: window.height,
      position: {
        x: window.pos_x,
        y: window.pos_y,
      },
    },
    source: window.datasource,
    render_mode: window.render_mode,
    settings: window.settings,
    z_index: window.z_index,
    aspect_ratio: window.aspect_ratio,
    is_hidden: window.is_hidden,
  };
  return dehydrated;
}

function hydrateWindow(data: DehydratedDataWindow): DataWindowState {
  const spec = store.getters.getSpecification(data.type) as ComponentRegistration;
  const win = createDataWindow(spec);
  const maxZ: number = store.getters["datawindows/windowsMaxZIndex"] + 1;
  win.title = clone(data.title || spec.friendly_name);
  win.width = data.layout.width || win.width;
  win.height = data.layout.height || win.height;
  win.pos_x = data.layout.position.x || win.pos_x;
  win.pos_y = data.layout.position.y || win.pos_y;
  win.datasource = data.source || win.datasource;
  win.render_mode = data.render_mode || win.render_mode;
  win.settings = { ...win.settings, ...clone(data.settings) };
  win.z_index = data.z_index || maxZ;
  win.aspect_ratio = data.aspect_ratio;
  win.is_hidden = data.is_hidden || false;

  return win;
}
