// store/modules/server.ts
import { Module } from 'vuex';

export interface ServerState {
  serverAddress: string | null;
}

const serverModule: Module<ServerState, any> = {
  namespaced: true,
  state: {
    serverAddress: null,
  },
  mutations: {
    setServerAddress(state, address: string) {
      state.serverAddress = address;
    },
  },
  actions: {
    updateServerAddress({ commit }, address: string) {
      commit('setServerAddress', address);
    },
  },
  getters: {
    getServerAddress: (state) => state.serverAddress,
  },
};

export default serverModule;
