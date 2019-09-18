<template>
    <div id='groupbox-container' style='padding-top: 15px; float: left;'>
      <b-card class="card-header" title="Group Selection">
          <b-form-group style="text-align: left;">
            <b-card-text>
              <b-form-checkbox-group v-model='selected' :options='availableGroups'
                @change='onChange($event)' stacked>
              </b-form-checkbox-group>
            </b-card-text>
          </b-form-group>
      </b-card>
    </div>
</template>

<script>
import DataModel from '@/models/DataModel'
import EventBus from '@/events/EventBus'

export default {
  name: 'groupbox',
  data () {
    return {
      selected: [],
      availableGroups: []
    }
  },
  mounted () {
    this.selected = DataModel.getSelectedGroups()
    this.availableGroups = DataModel.getAvailableGroups()
  },
  methods: {
    onChange (event) {
      DataModel.updateSelectedGroups(event)
      EventBus.$emit('updateSelectedGroups', event)
    }
  }
}
</script>

<style scoped>

</style>
