<template>
    <div id="groupbox-container" style="padding-top: 15px; padding-bottom: 15px;">
        <b-card class="group-selection-box" border-variant="dark" header="Group Selection" align="center">
            <b-card-text class="groupbox-contents">
                <ul>
                    <b-form-checkbox :value="group" unchecked-value="not_accepted" v-model="selected" v-on:update="sendGroupsToParent(this.selected)"
                        v-for="group in this.$root.$data.sharedState.cohort_groups" :key="group.name">{{ group }}</b-form-checkbox>
                </ul>
                <div>Selected: <strong style="font-size: 13px;">{{ selected }}</strong></div>
            </b-card-text>
        </b-card>
    </div>
</template>

<script>
export default {
  name: 'group-checkbox',
  data () {
    return {
      selected: []
    }
  },
  methods: {
    sendGroupsToParent: function () {
      this.$emit('updateSelectedGroups', this.selected)
    }
  }
}
</script>

<style scoped>
#groupbox-container .groupbox-contents {
    text-align: left;
}
</style>
