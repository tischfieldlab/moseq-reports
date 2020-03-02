
import store from '@/store/root.store';
import { spawn, Thread, Worker } from 'threads';
import { deleteFolderRecursive } from '@/util/Files';


export interface DataLoaderState {
    bundle: string; // path to the bundle
    name: string; // basename of the bundle
    path: string; // path to uncompressed data
    datasets: {};
}

export default async function LoadDataBundle(filepath: string) {
    CleanState((store.state as any).datasets.path);

    const loader = await spawn(new Worker('@/models/DataLoaderWorker'));
    const data = await loader.LoadDataBundle(filepath);

    console.log('loaded data:', data);

    await Thread.terminate(loader);
}



function CleanState(filepath: string) {
    deleteFolderRecursive(filepath);
}
