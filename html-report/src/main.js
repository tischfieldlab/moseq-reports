// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

// Bootstrap Stuff
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false
Vue.use(BootstrapVue)

var store = {
  state: {
    cohort_groups: [
      'M_+/+',
      'M_+/CT',
      'M_CT/CT',
      'F_+/+',
      'F_+/CT',
      'F_CT/CT'
    ],
    selected_groups: []
  }
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  data: {
    sharedState: store.state
  },
  methods: {
    updateSelectedGroups: function (groups) {
      this.sharedState.selected_groups = groups
    }
  }
})
