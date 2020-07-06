

export interface HistoryState {
    items: HistoryItem[];
}

export interface HistoryItem {
    time: Date;
    message: string;
    variant: string;
}