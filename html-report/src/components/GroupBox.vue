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
export default {
  name: 'groupbox',
  props: {
    dataModel: null
  },
  data () {
    return {
      selected: this.dataModel.getSelectedGroups(),
      availableGroups: this.dataModel.getAvailableGroups()
    }
  },
  methods: {
    onChange (event) {
      this.dataModel.updateSelectedGroups(event)
      this.$emit('updateGroupSelection', event)
    }
  }
}
</script>

<style scoped>
</style>
