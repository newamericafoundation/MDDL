import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import { config } from '@vue/test-utils'

Vue.use(Vuetify)
Vue.use(Vuex)
config.mocks.$t = (key: string) => key
config.mocks.$i18n = {
  locale: 'en',
  locales: [],
}
