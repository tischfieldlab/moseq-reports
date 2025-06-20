import { getCurrentInstance, } from "vue";
import { pauseTracking, enableTracking } from '@vue/reactivity';


export function useLoadingMixin() {
    const instance = getCurrentInstance();
    if (!instance) {
        throw new Error("useLoadingMixin must be called within a component setup function.");
    }
    const { emit } = instance;

    function emitStartLoading(): void {
        //pauseTracking(); // Pause reactivity tracking to avoid unnecessary updates
        emit("start-loading");
        //enableTracking(); // Re-enable reactivity tracking
        //console.log(instance?.proxy?.$options.name, "start-loading event emitted");
    }
    function emitFinishLoading(): void {
        //pauseTracking(); // Pause reactivity tracking to avoid unnecessary updates
        emit("finish-loading");
        //enableTracking(); // Re-enable reactivity tracking
        //console.log(instance?.proxy?.$options.name, "finish-loading event emitted");
    }

    return {
        emitStartLoading,
        emitFinishLoading,
    };
}

