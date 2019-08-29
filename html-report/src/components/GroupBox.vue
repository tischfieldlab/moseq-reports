<template>
    <div id="groupbox-container" style="padding-top: 15px;">
      <b-card title="Group Selection">
          <b-form-group style="text-align: left;">
            <b-card-text>
              <b-form-checkbox-group v-model="selected" @change="onChange($event)"
                :options="this.$root.$data.sharedState.cohortGroups" plain stacked>
              </b-form-checkbox-group>
            </b-card-text>
          </b-form-group>

          <div style="text-align: left;">
            Selected: <strong> {{ selected }} </strong>
          </div>
      </b-card>
    </div>
</template>

<script>
export default {
  name: 'group-checkbox',
  data () {
    return {
      selected: this.$root.$data.sharedState.cohortGroups
    }
  },
  methods: {
    onChange (event) {
      if (this.$root.$data.sharedState.debug) {
        console.log(event)
      }
      this.$emit('updateGroups', event)
    }
  }
}
</script>

<style scoped>
</style>
