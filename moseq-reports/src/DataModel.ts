import DataFrame from 'dataframe-js';
import Vue from 'vue';

/* tslint:disable */
const meta = require('./metadata/metadata.js');

export enum EventType {
    GROUPS_CHANGE = 'selectedGroupsChange',
    SYLLABLE_CHANGE = 'selectedSyllableChange',
}

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
        this.$on(type, ((event: any) => {
            callback(event);
        }));
    }
}

class DataModel {
    private static instance : DataModel;
    
    private availableGroups     :   Array<string> = [];
    private maxSyllable         :   number = 0;
    private selectedGroups      :   Array<string> = [];
    private selectedSyallable   :   number = 0;
    private baseDataframe       :   any = null;
    private aggregateView       :   any = null;
    private eventBus            :   EventBus = new EventBus();

    public view                 :   any = null;

    public static getInstance() {
        if (!DataModel.instance) {
            DataModel.instance = new DataModel();
        }

        return DataModel.instance;
    }

    private constructor() {
        this.availableGroups = meta.cohortGroups;

        this.selectedGroups = this.availableGroups;
        this.baseDataframe = new DataFrame(meta.dataframeJson.data, meta.dataframeJson.columns);
        
        this.maxSyllable = this.baseDataframe.filter((row: any) => row.get('syllable')).distinct('syllable').toArray().length;

        this.updateView();
    }

    /**
     * Updates the view dataframe by filtering out the groups
     * that were not selected from the UI.  
     *
     * @private
     * @memberof DataModel
     */
    private updateView() {
        let excludeGroups : Array<string> = [];
        for (var i = 0; i < this.availableGroups.length; i++) {
            if (!this.selectedGroups.includes(this.availableGroups[i])) {
                excludeGroups.push(this.availableGroups[i]);
            }
        }

        var dfClone = this.baseDataframe.toDict();
        dfClone = new DataFrame(dfClone);
        for (i = 0; i < excludeGroups.length; i++) {
            dfClone = dfClone.filter((row : any) => row.get('group') !== excludeGroups[i]);
        }

        this.aggregateView = dfClone.groupBy('syllable', 'group').aggregate((g: any) => g.stat.mean('usage'))
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
     * @param {Array<string>} groups    New list of groups to display
     *                                  and model.
     * @memberof DataModel
     */
    public updateSelectedGroups(groups : Array<string>) {
        if (groups === null) {
            throw new Error('Illegal Argument: Argument must not be null.');
        }

        this.selectedGroups = groups;
        this.updateView();

        // NOTE: Fire the event so everyone knows groups changed
        this.eventBus.fire(EventType.GROUPS_CHANGE, groups);
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
     * @returns {Array<string>} The list of selected groups.
     * @memberof DataModel
     */
    public getSelectedGroups() {
        return this.selectedGroups;
    }

    /**
     * Returns the list of all available groups that
     * gets populated from the metadata.json file.
     *
     * @returns {Array<string>} List of all available groups.
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