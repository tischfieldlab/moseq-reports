import { ComponentPublicInstance } from "vue";

class WindowManager {
    // Internal map of window IDs to their corresponding Vue component instances.
    private windows: Map<string, ComponentPublicInstance> = new Map<string, ComponentPublicInstance>();

    /**
     * Adds a Vue component instance to the list of windows managed by this object.
     * @param {string} key Unique key for the window.
     * @param {ComponentPublicInstance} window Vue component instance to add to the manager.
     * @public
     * @returns {void}
     */
    public addWindow(key: string, window: ComponentPublicInstance): void {
        this.windows.set(key, window);
    }

    /**
     * Removes a Vue component instance from the list of windows managed by this object.
     * @param {string} key Unique key for the window.
     * @public
     * @returns {void}
     */
    public removeWindow(key: string): void {
        this.windows.delete(key);
    }

    /**
     * Returns the list of windows managed by this manager.
     * @param {(value: ComponentPublicInstance, index: number, array: ComponentPublicInstance[]) => boolean} predicate? Predicate to filter windows by.
     * @public
     * @returns {ComponentPublicInstance[]} List of windows managed by the manager.
     */
    public getWindows(
        predicate?: (value: ComponentPublicInstance, index: number, array: ComponentPublicInstance[]) => boolean
    ): ComponentPublicInstance[] {
        const result = [...this.windows.values()];
        if (predicate) {
            return result.filter(predicate);
        } else {
            return result;
        }
    }

    /**
     * Returns the Vue component instance associated with the given ID.
     * @param {string} id ID of the window to return.
     * @returns {ComponentPublicInstance | undefined} The window corresponding to the given ID, or `undefined` if it is not found.
     */
    public getWindowByID(id: string): ComponentPublicInstance | undefined {
        return this.windows.get(id);
    }
}

const manager = new WindowManager();

export default manager;
