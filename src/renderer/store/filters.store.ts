import { Module } from "vuex";
import { RootState } from "@render/store/root.types";
import store from "@render/store/root.store";
import { getModuleNamespace } from "@render/util/Vuex";
import DataviewModule from "@render/store/dataview.store";

interface FiltersState {
  basename: string;
  items: string[];
}

const FiltersModule: Module<FiltersState, RootState> = {
  namespaced: true,
  state() {
    return {
      basename: "dataview",
      items: [],
    };
  },
  mutations: {
    addFilter(state, namespace: string) {
      state.items.push(namespace);
    },
    removeFilter(state, namespace: string) {
      const start = state.items.indexOf(namespace);
      if (start !== -1) {
        state.items.splice(start, 1);
      }
    },
  },
  getters: {
    default(state) {
      return state.items[0];
    },
  },
  actions: {
    async serializeFilters(context): Promise<any> {
      try {
        const dehydrated = context.state.items.map(async (id) => {
          return [
            id.split("/")[1],
            await context.dispatch(`${id}/serialize`, undefined, { root: true }),
          ] as [string, Promise<any>];
        });
        return Object.fromEntries(await Promise.all(dehydrated));
      } catch (error) {
        console.error("Error serializing filters:", error);
        throw error;
      }
    },
    async loadFilters(context, filters: any) {
      try {
        const existing = [...context.state.items];
        const imported: string[] = [];
        const namespace = getModuleNamespace(store, context.state) as string;

        for (const [name, filter] of Object.entries(filters)) {
          const fullpath = `${namespace}/${name}`;
          imported.push(fullpath);

          if (existing.includes(fullpath)) {
            await store.dispatch(`${fullpath}/load`, filter, { root: true });
          } else {
            store.registerModule([namespace, name], DataviewModule, {});
            await store.dispatch(`${fullpath}/initialize`, { root: true });
            await store.dispatch(`${fullpath}/load`, filter, { root: true });
            context.commit("addFilter", fullpath);
          }
        }

        existing
          .filter((ns) => !imported.includes(ns))
          .forEach((id) => context.dispatch("removeFilter", id));
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    },
    async addFilter(context) {
      try {
        const namespace = getModuleNamespace(store, context.state) as string;
        let i = 0;
        while (true) {
          const name = `${context.state.basename}-${i}`;
          if (!store.state[namespace] || store.state[namespace][name] === undefined) {
            const fullpath = `${namespace}/${name}`;
            store.registerModule([namespace, name], DataviewModule, {});

            if ((store.state as any).datasets.usageByUsage !== null) {
              await store.dispatch(`${fullpath}/initialize`);
            }

            context.commit("addFilter", fullpath);
            return fullpath;
          }
          i++;
        }
      } catch (error) {
        console.error("Error adding filter:", error);
        throw error;
      }
    },
    removeFilter(context, namespace: string) {
      try {
        context.commit("removeFilter", namespace);

        const winsUsingFilter = context.rootGetters["datawindows/windowsUsingDataView"](namespace);
        for (const win of winsUsingFilter) {
          context.commit(`${win}/updateComponentDataSource`, { source: context.getters.default }, { root: true });
        }

        store.unregisterModule(namespace.split("/"));
      } catch (error) {
        console.error("Error removing filter:", error);
      }
    },
  },
};

export default FiltersModule;
