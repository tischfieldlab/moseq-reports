import DataFrame from 'dataframe-js'
import * as meta from '@/metadata/metadata'

class DataModel {
  availableGroups = []
  selectedGroups = []
  baseDataframe = null
  view = null // This is the dataframe that is filtered by group selection
  // and is presented to ALL components.

  constructor () {
    if (!this.instance) {
      this.instance = this
    }
    return this.instance
  }

  loadDataframe () {
    this.baseDataframe = new DataFrame(meta.dataframeJson.data, meta.dataframeJson.columns)
    this.view = new DataFrame(meta.dataframeJson.data, meta.dataframeJson.columns)
  }

  loadAvailableGroups () {
    this.availableGroups = meta.cohortGroups
    this.selectedGroups = meta.cohortGroups
  }

  updateView (groups) {
    // Get excluded groups so we can removed them from the dataframe
    let excludedGroups = []
    for (var i = 0; i < this.availableGroups.length; i++) {
      if (!this.selectedGroups.includes(this.availableGroups[i])) {
        excludedGroups.push(this.availableGroups[i])
      }
    }

    // Do this to avoid using the reference... we are copying the object, not passing
    // the reference.
    var dfClone = this.baseDataframe.toDict()
    dfClone = new DataFrame(dfClone)
    for (i = 0; i < excludedGroups.length; i++) {
      dfClone = dfClone.filter(row => row.get('group') !== excludedGroups[i])
    }

    this.view = dfClone
  }

  updateSelectedGroups (groups) {
    this.selectedGroups = groups
    this.updateView(groups)
  }

  getSelectedGroups () {
    let clone = [...this.selectedGroups]
    return clone
  }

  getAvailableGroups () {
    let clone = [...this.availableGroups]
    return clone
  }

  getView () {
    if (this.view) {
      let clone = this.view.toDict()
      clone = new DataFrame(clone)
      return clone
    }
    return null
  }
}

const instance = new DataModel()
export default instance
