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
    cohortGroups: [
      'M_+/+',
      'M_+/CT',
      'M_CT/CT',
      'F_+/+',
      'F_+/CT',
      'F_CT/CT'
    ],
    debug: true
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
  }
})
