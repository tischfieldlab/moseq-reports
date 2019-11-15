import { expect, assert } from 'chai';
import { shallowMount, mount } from '@vue/test-utils';

import DataModel, { EventType } from '@/DataModel';

describe('DataModel', () => {
  const meta = require('../data/metadata.js');
  it('checks if data model gets the correct data from the json file.', () => {
    const groups: string[] = meta.cohortGroups;
    assert.deepEqual(groups, DataModel.getAvailableGroups());
  });
});

describe('DataModel SelectedGroups', () => {
  const meta = require('../data/metadata.js');

  it('Checks if data model updates groups correctly, and does not change available groups.', () => {
    const correct: string[] = ['+/+_female', '+/CT_female', 'CT/CT_female'];
    const data: string[] = ['+/+_female', '+/CT_female', 'CT/CT_female'];

    DataModel.updateSelectedGroups(data);

    assert.deepEqual(correct, DataModel.getSelectedGroups());
    assert.deepEqual(meta.cohortGroups, DataModel.getAvailableGroups());
  });
});

describe('DataModel SelectedSyllable', () => {
  const meta = require('../data/metadata.js');

  it('Checks if data model updates syllable correctly, and does not change max syllable.', () => {
    const correct: number = 11;
    const data: number = 11;

    const oldSyllable: number = DataModel.getMaxSyllable();

    DataModel.updateSelectedSyllable(data);

    assert.equal(correct, DataModel.getSelectedSyllable());
    assert.equal(oldSyllable, DataModel.getMaxSyllable());
  });
});

describe('DataModel EventType SYLLABLE_CHANGE', () => {
  it('Checks if data model updates syllable correctly, and fires correct event.', () => {
    let y: number = -1;
    const fun = function test(x: number) { y = x; };
    DataModel.subscribe(EventType.SYLLABLE_CHANGE, fun);

    for (let i: number = 0; i <= DataModel.getMaxSyllable(); i++) {
      DataModel.updateSelectedSyllable(i);
      assert.equal(i, y);
    }
  });
});

describe('DataModel EventTpye GROUPS_CHANGE', () => {
  it('Checks if data model updates groups correctly, and fires correct event.', () => {
    let y: string[] = [];
    const fun = function test(x: string[]) { y = x; };
    DataModel.subscribe(EventType.GROUPS_CHANGE, fun);

    const data: string[] = ['+/+_female', '+/CT_male', 'CT/CT_male'];

    DataModel.updateSelectedGroups(data);
    assert.equal(data, y);
  });
});

// TODO: Test the view
