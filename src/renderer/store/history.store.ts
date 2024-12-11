import { Module } from "vuex";
import { RootState } from "@render/store/root.types";
import { HistoryState, HistoryItem } from "@render/store/history.types";

const HistoryModule: Module<HistoryState, RootState> = {
  namespaced: true,
  state() {
    return {
      items: [] as HistoryItem[], // Array of history items
    };
  },
  mutations: {
    /**
     * Add a new entry to the history.
     * @param state - Current state of the module.
     * @param payload - Partial history item to add.
     */
    addEntry(state, payload: Partial<HistoryItem>) {
      state.items.push({
        time: payload.time || new Date(),
        message: payload.message || "",
        variant: payload.variant || "default",
        details: payload.details || null,
      });
    },

    /**
     * Remove an entry from the history by its index.
     * @param state - Current state of the module.
     * @param idx - Index of the item to remove.
     */
    removeEntry(state, idx: number) {
      if (idx >= 0 && idx < state.items.length) {
        state.items.splice(idx, 1);
      }
    },
  },
};

export default HistoryModule;
