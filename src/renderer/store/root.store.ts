import { createStore, StoreOptions } from "vuex"; // Use 'createStore' for Vuex 4
import { RootState, ComponentRegistration, SidebarPosition } from "@render/store/root.types";
import DatasetsStore from "@render/store/datasets.store";
import FiltersModule from "@render/store/filters.store";
import WindowsModule from "@render/store/windows.store";
import HistoryModule from "@render/store/history.store";
import serverModule from "@render/store/serveraddress.store";

const store: StoreOptions<RootState> = {
  strict: process.env.NODE_ENV !== "production",
  modules: {
    datasets: DatasetsStore,
    filters: FiltersModule,
    datawindows: WindowsModule,
    history: HistoryModule,
    server: serverModule,
  },
  state: {
    registry: [] as ComponentRegistration[],
    sidebarPosition: SidebarPosition.Left,
  },
  getters: {
    getSpecification: (state) => (componentType: string) => {
      console.log("Registered specifications:", state.registry);
      return state.registry.find((r) => r.component_type === componentType);
    },
  },
  mutations: {
    registerComponent(state, payload: ComponentRegistration) {
      const loc = state.registry.findIndex((r) => r.component_type === payload.component_type);
      if (loc === -1) {
        state.registry.push(payload);
      } else {
        console.warn(`${payload.component_type} has already been registered! Merging...`);
        state.registry.splice(loc, 1, payload);
      }
    },
    setSidebarPosition(state, payload: SidebarPosition) {
      state.sidebarPosition = payload;
    },
  },
  actions: {},
};

export default createStore<RootState>(store); // Use 'createStore' for Vuex 4
