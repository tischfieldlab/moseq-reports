import Vue from "vue";

class WindowManager {
    // Internal map of window ID's to their corresponding Vue instance.
    private windows: Map<string, Vue> = new Map<string, Vue>();

    /**
     * Adds a Vue instance to the list of windows managed by this
     * object.
     * @param  {Vue} window Vue instance to add to the manager.
     * @public
     * @returns void
     */
    public addWindow(key: string, window: Vue): void {
        this.windows.set(key, window);
    }

    /**
     * Removes a Vue instance from the list of windows managed by this
     * object.
     * @param  {Vue} target Vue instance to remove from the manager.
     * @public
     * @returns void
     */
    public removeWindow(key: string): void {
        this.windows.delete(key);
    }

    /**
     * Returns this list of windows managed by this manager.
     * @returns Vue[] List of windows managed by the manager.
     */
    public getWindows(): Vue[] {
        return [...this.windows.values()];
    }

    /**
     * Returns the Vue window associated with the given ID.
     * @param  {string} id ID of the window to return.
     * @returns Vue | undefined The window corresponding to the given ID, or `undefined` if it is not found.
     */
    public getWindowByID(id: string): Vue | undefined {
        return this.windows.get(id);
    }
}

const manager = new WindowManager();

export default manager;
