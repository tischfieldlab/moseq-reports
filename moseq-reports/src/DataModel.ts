import DataFrame from 'dataframe-js';
import Vue from 'vue';

/* tslint:disable */
const meta = require('./metadata/metadata.js');

export enum EventType {
    GROUPS_CHANGE = 'selectedGroupsChange',
    SYLLABLE_CHANGE = 'selectedSyllableChange',
}

class EventBus extends Vue {

    public fire(type: EventType, event: any) {
        this.$emit(type, event);
    }

    public subscribe(type: EventType, callback: Function) {
        this.$on(type, ((event: any) => {
            callback(event);
        }));
    }
}

class DataModel {
    private static instance : DataModel;
    
    private availableGroups: Array<string> = [];
    private maxSyllable: number = -1;

    private selectedGroups: Array<string> = [];
    private selectedSyallable : number = -1;

    private baseDataframe : any = null;
    private usageDataframe : any = null;

    private eventBus : EventBus = new EventBus();
    public view : any = null;

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

        this.usageDataframe = dfClone.groupBy('syllable', 'group').aggregate((g: any) => g.stat.mean('usage'))
                .rename('aggregation', 'usage');

        this.view = dfClone;
    }


    // This subscribes a callback function to a certain event
    // type that will occur. This should be done by every component
    // that needs to know when an event happens externally. The
    // component does this in the 'mounted()' hook-in.
    public subscribe(type: EventType, callback: Function) {
        this.eventBus.subscribe(type, callback);
    }

    // ********* Setter Functions ********* \\
    public updateSelectedSyllable(syllable : number) {
        this.selectedSyallable = syllable;

        // Fire the event so everyone knows syllable changed
        this.eventBus.fire(EventType.SYLLABLE_CHANGE, syllable);
    }

    public updateSelectedGroups(groups : any) {
        this.selectedGroups = groups;
        this.updateView();

        // Fire the event so everyone knows groups changed
        this.eventBus.fire(EventType.GROUPS_CHANGE, groups);
    }


    // ********* Getter Functions ********* \\
    public getSelectedSyllable() {
        return this.selectedSyallable;
    }

   
    public getSelectedGroups() {
        return this.selectedGroups;
    }

    public getAvailableGroups() {
        return this.availableGroups;
    }

    public getView() {
        return this.view;
    }

    public getUsageDataframe() {
        return this.usageDataframe;
    }

    public getMaxSyllable() {
        return this.maxSyllable;
    }
}

const instance = DataModel.getInstance();
export default instance;