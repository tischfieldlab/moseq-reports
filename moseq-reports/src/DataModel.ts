import DataFrame from 'dataframe-js';

/* tslint:disable */
const meta = require('./metadata/metadata.js');

class DataModel {
    private static instance : DataModel;
    
    private availableGroups = [];
    private selectedGroups = [];
    private baseDataframe : any = null;
    private usageDataframe : any = null;
    private selectedSyallable : number = -1;

    public view : any = null;

    public static getInstance() {
        if (!DataModel.instance) {
            DataModel.instance = new DataModel();
        }

        return DataModel.instance;
    }

    private constructor() {
        this.availableGroups = meta.cohortGroups;
        this.selectedGroups = meta.cohortGroups;

        this.baseDataframe = new DataFrame(meta.dataframeJson.data, meta.dataframeJson.columns);
        
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

    public updateSelectedSyllable(syllable : number) {
        this.selectedSyallable = syllable;
    }

    public getSelectedSyllable() {
        return this.selectedSyallable;
    }

    public updateSelectedGroups(groups : any) {
        this.selectedGroups = groups;
        this.updateView();
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
}

const instance = DataModel.getInstance();
export default instance;