// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import 'es6-promise/auto'
import './plugins/vuetify'
import Vuetify from 'vuetify'
import vuescroll from 'vuescroll'
import globalComponents from '../src/plugins/globalComponents'
import router from './router.js'
import DashboardPlugin from './plugins/dashboard-plugin';
import App from './App'
import { store } from './store/store.js'
import './plugins/demo.scss'
import VueAmplitude from 'vue-amplitude';
Vue.config.productionTip = false

Vue.use(VueAmplitude, { apiKey: 'f1f895bc97a1dfc905ea1bbc1f4af3f7' });
Vue.use(router)
Vue.use(Vuetify)
Vue.use(globalComponents)
Vue.use(DashboardPlugin);
// Vue.use(Editor);
Vue.use(vuescroll, {
  ops: {
    vuescroll: {
      mode: 'native',
      sizeStrategy: 'percent',
      detectResize: true
    },
    bar: {
      showDelay: 500,
      onlyShowBarOnScroll: true,
      keepShow: false,
      background: '#c1c1c1',
      opacity: 1,
      hoverStyle: false,
      specifyBorderRadius: false,
      minSize: 0,
      size: '6px',
      disable: false
    }
  },
  name: 'vuescroll' // customize component name, default -> vueScroll
})

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
