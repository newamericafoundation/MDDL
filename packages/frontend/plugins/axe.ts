import Vue from 'vue'

if (process.env.NODE_ENV === 'development') {
  const VueAxe = require('vue-axe').default
  Vue.use(VueAxe, {
    delay: 1000,
  })
}
