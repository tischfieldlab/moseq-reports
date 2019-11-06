import { expect, assert } from 'chai';
import { shallowMount, mount } from '@vue/test-utils';

import DataModel from '@/DataModel';

import GroupBox from '@/components/GroupBox.vue';

describe('GroupBox.vue', () => {
    it('checks if group box recieves the correct data from the data model.', () => {
      const groups = DataModel.getAvailableGroups();
      const wrapper = shallowMount(GroupBox);
      assert.equal(groups, wrapper.vm.$data.availableGroups);
    });
});
