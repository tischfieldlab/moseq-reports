import { defineStore, acceptHMRUpdate } from 'pinia'
import { VNode } from 'vue';


export interface HistoryState {
    items: HistoryItem[];
}

export interface HistoryItem {
    time: Date;
    message: string | (() => VNode);
    variant: string;
    details: string | null;
}

export const useHistoryStore = defineStore('history', {
    state: (): HistoryState => ({
        items: [] as HistoryItem[], // Array of history items
    }),
    actions: {
        /**
         * Add a new entry to the history.
         * @param payload - Partial history item to add.
         */
        addEntry(payload: Partial<HistoryItem>) {
            this.items.push({
                time: payload.time || new Date(),
                message: payload.message || "",
                variant: payload.variant || "default",
                details: payload.details || null,
            });
        },

        /**
         * Remove an entry from the history by its index.
         * @param idx - Index of the item to remove.
         */
        removeEntry(idx: number) {
            if (idx >= 0 && idx < this.items.length) {
                this.items.splice(idx, 1);
            }
        },
    },
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useHistoryStore, import.meta.hot))
}
