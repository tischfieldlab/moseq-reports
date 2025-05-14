import { Operation } from "@render/api/DataLoader.types";

export interface DataQuerySettings {
    dataset: string,
    operations: Operation[],
}