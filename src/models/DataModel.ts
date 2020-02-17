import DataFrame from 'dataframe-js';
import Vue from 'vue';
import store from '@/store/root.store';
import { CountMethod } from '@/store/dataview.store';

/* tslint:disable */
export enum EventType {
    GROUPS_CHANGE = 'selectedGroupsChange',
    SYLLABLE_CHANGE = 'selectedSyllableChange',
    METADATA_LOADED = 'metadataLoaded',
    GROUP_COLORS_CHANGE = 'groupColorsChange',
}



export interface MetadataJson {
    dataframeJson: any,
    cohortGroups: string[]
};

class EventBus extends Vue {


    /**
     * Uses the event system implemented by Vue components
     * to emit the event passed in so that all functions
     * registered to listen, can have their functions 
     * called.
     *
     * @param {EventType} type  The enum representing the specific
     *                          event that will be fired.
     * @param {*} event         The event arguments to be passed to
     *                          the callback functions.
     * @memberof EventBus
     */
    public fire(type: EventType, event: any) {
        this.$emit(type, event);
    }

    /**
     * Uses the event system implemented by all Vue components
     * to call all of the subscribed callback functions based
     * off the passed in event being emitted.
     *
     * @param {EventType} type      The enum representing the specific
     *                              event that will be fired.
     * @param {Function} callback   The function that will be called 
     *                              when the event passed in is fired.
     * @memberof EventBus
     */
    public subscribe(type: EventType, callback: Function) {
        this.$on(type, callback);
    }


    /**
     * Uses the event system implemented by all Vue components
     * to remove all of the subscribed functions based off the
     * passed in event.
     *
     * @param {EventType} type      The enum representing the specific
     *                              event subscribed to.
     * @param {Function} callback   The function that will be removed.
     * @memberof EventBus
     */
    public unsubscribe(type: EventType, callback: Function) {
        this.$off(type, callback);
    }
}

class DataModel {
    private static instance : DataModel;
    
    private countMethod: CountMethod;
    private availableGroups     :   string[] = [];
    private maxSyllable         :   number = 0;
    private selectedGroups      :   string[] = [];
    private groupColors         :   string[] = [];
    private selectedSyallable   :   number = 0;
    // private baseDataframe       :   any = null;
    private aggregateView       :   any = null;
    private eventBus            :   EventBus = new EventBus();

    public view                 :   any = null;

    public static getInstance() {
        if (!DataModel.instance) {
            DataModel.instance = new DataModel();
        }

        return DataModel.instance;
    }

    /**
     * Creates an instance of DataModel, and tries to load in metadata
     * from 'metadata/metadata.msq' file if it exists, and will load in
     * the data to the datamodel. If no file exists at that location,
     * it will default all datamodel values to null or 0.
     *
     * @memberof DataModel
     */
    private constructor() {
        this.countMethod = CountMethod.Usage;
        this.availableGroups = [];
        this.groupColors = [];
        // this.baseDataframe = null;
        this.selectedGroups = [];
        this.maxSyllable = 100;
    }

    /**
     * Updates the datamodel and render components based on new metadata json
     * information read in from a file selected through the UI.
     *
     * @param {MetadataJson} jsonFile   The json object that contains the new
     *                                  metadata information to be loaded in.
     * @memberof DataModel
     */
    public loadMetadataFile(jsonFile: any) {
        this.availableGroups = (store.state as any).datasets.groups;
        this.selectedGroups = (store.state as any).datasets.groups;

        this.maxSyllable = this.getBaseDataFrame()
                               .filter((row: any) => row.get('syllable'))
                               .distinct('syllable')
                               .toArray().length;

        // NOTE: THIS NEEDS TO BE FIRST OTHERWISE IT WON'T BE CALLED SYNCHRONOUSLY
        this.updateView();

        this.eventBus.fire(EventType.GROUPS_CHANGE, this.availableGroups);
        this.eventBus.fire(EventType.SYLLABLE_CHANGE, 0);
        this.eventBus.fire(EventType.METADATA_LOADED, null);
    }

    private getBaseDataFrame() {
        let data;
        if (this.countMethod === CountMethod.Usage){
            data = (store.state as any).datasets.usageByUsage;
        } else if (this.countMethod === CountMethod.Frames) {
            data = (store.state as any).datasets.usageByFrames;
        }else {
            throw new Error('Unknown Count Method '+this.countMethod);
        }
        return new DataFrame(data.data, data.columns);
    }

    /**
     * Updates the view dataframe by filtering out the groups
     * that were not selected from the UI.  
     *
     * @private
     * @memberof DataModel
     */
    private updateView() {
        let excludeGroups : string[] = [];
        for (let i = 0; i < this.availableGroups.length; i++) {
            if (!this.selectedGroups.includes(this.availableGroups[i])) {
                excludeGroups.push(this.availableGroups[i]);
            }
        }

        let dfClone = this.getBaseDataFrame();
        for (let i = 0; i < excludeGroups.length; i++) {
            dfClone = dfClone.filter((row : any) => row.get('group') !== excludeGroups[i]);
        }

        this.aggregateView = dfClone.groupBy('syllable', 'group')
                                    .aggregate((g: any) => g.stat.mean('usage'))
                                    .rename('aggregation', 'usage');

        this.view = dfClone;
    }


    /**
     * Subscribes a callback function that will be called
     * once the event passed in is fired. This should be used
     * by a component in the 'mounted' hook-in.
     *
     * @param {EventType} type      The specific event to subscribe to.
     * @param {Function} callback   The function to be called once the 
     *                              event fires.
     * @memberof DataModel
     */
    public subscribe(type: EventType, callback: Function) {
        this.eventBus.subscribe(type, callback);
    }
    public unsubscribe(type: EventType, callback: Function) {
        this.eventBus.unsubscribe(type, callback);
    }

    /**
     * Updates the selected syllable data field. This is called
     * when the syllable is changed through the UI. It will fire
     * the SYLLABLE_CHANGE event after which all subscribed 
     * callback functions will be called.
     *
     * @param {string} syllable The new syllable ID. 
     * @memberof DataModel     
     */
    public updateSelectedSyllable(syllable : number) {
        const syl = Number.parseInt(syllable.toString());
        if (isNaN(syl)) {
            throw new Error(`Illegal Argument: Argument ${syl} cannot be NaN.`);
        }
        
        if (syl > this.maxSyllable) {
            throw new Error(`Illegal Argument: Argument ${syl} must be < max syllable.`);
        }
        
        if (syl < 0) {
            throw new Error(`Illegal Argument: Argument ${syl} must be > 0.`);
        }

        this.selectedSyallable = syl;

        // NOTE: Fire the event so everyone knows syllable changed
        this.eventBus.fire(EventType.SYLLABLE_CHANGE, this.selectedSyallable);
    }

    /**
     * Updates the selected groups based on UI input
     * and fires the GROUPS_CHANGE event.
     *
     * @param {string[]} groups    New list of groups to display
     *                                  and model.
     * @memberof DataModel
     */
    public updateSelectedGroups(groups : string[]) {
        if (groups === null) {
            throw new Error('Illegal Argument: Argument must not be null.');
        }

        this.selectedGroups = groups;
        this.updateView();

        // NOTE: Fire the event so everyone knows groups changed
        this.eventBus.fire(EventType.GROUPS_CHANGE, groups);
    }

    public updateSelectedGroupColors(colors: string[]) {
        this.groupColors = colors;
        this.eventBus.fire(EventType.GROUP_COLORS_CHANGE, colors);
    }
    public getSelectedGroupColors() {
        return this.groupColors;
    }

    public updateCountMethod(countMethod: CountMethod) {
        this.countMethod = countMethod;
        this.updateView();
        this.eventBus.fire(EventType.METADATA_LOADED, null);
    }
    public getCountMethod() {
        return this.countMethod;
    }


    /**
     * Returns the selected syllable.
     *
     * @returns {int}   The currently selected syllable.
     * @memberof DataModel
     */
    public getSelectedSyllable() {
        return this.selectedSyallable;
    }

   
    /**
     * Returns the list of selected groups.
     *
     * @returns {string[]} The list of selected groups.
     * @memberof DataModel
     */
    public getSelectedGroups() {
        return this.selectedGroups;
    }

    /**
     * Returns the list of all available groups that
     * gets populated from the metadata.json file.
     *
     * @returns {string[]} List of all available groups.
     * @memberof DataModel
     */
    public getAvailableGroups() {
        return this.availableGroups;
    }


    /**
     * Returns the current, filtered dataframe that 
     * contains only the groups that are selected from
     * the UI.
     *
     * @returns {DataFrame} The filtered dataframe that contains
     *                      only the data corresponding to the
     *                      currently selected groups.
     * @memberof DataModel
     */
    public getView() {
        return this.view;
    }

    /**
     * Returns the aggregate datamodel computed on the mean
     * of the syllable usages. This pulls from the currently
     * selected groups, meaning it does not account for 
     * groups that are not selected from the UI.
     *
     * @returns {DataFrame} The aggregate syllable usage computed
     *                      on the mean of the syllable usage of 
     *                      the current selected groups only.
     * @memberof DataModel
     */
    public getAggregateView() {
        return this.aggregateView;
    }


    /**
     * Returns the maximum allowed syllable. This is determined
     * by the baseDataframe object where the max syllable is pulled
     * from the syllable column.
     *
     * @returns {number}    The maximum value syllable ID.
     * @memberof DataModel
     */
    public getMaxSyllable() {
        return this.maxSyllable;
    }
}

const instance = DataModel.getInstance();
export default instance;