import { expect, assert } from 'chai';
import { shallowMount, mount } from '@vue/test-utils';

import DataModel from '@/DataModel';

import GroupBox from '@/components/GroupBox.vue';

describe('GroupBox', () => {
  it('checks if group box recieves the correct groups from the data model.', () => {
    const groups = DataModel.getAvailableGroups();
    const wrapper = shallowMount(GroupBox);
    assert.equal(groups, wrapper.vm.$data.availableGroups);
  });
});

describe('GroupBox', () => {
  it('checks if the options data is valid and is the right length.', () => {
    const wrapper = shallowMount(GroupBox);
    assert(wrapper.vm.$data.options !== null);
    assert(wrapper.vm.$data.options.length === (DataModel.getMaxSyllable() + 1));
  });
});
