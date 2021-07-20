

export interface HistoryState {
    items: Array<HistoryItem>;
}

export interface HistoryItem {
    time: Date;
    message: string;
    variant: string;
    details: string|null;
}
