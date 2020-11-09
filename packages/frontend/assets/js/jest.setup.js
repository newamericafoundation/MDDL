import {
  shallowMount as baseShallowMount,
  mount as baseMount,
  createLocalVue,
  RouterLinkStub as routerLinkStub,
  config,
} from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import VueI18n from 'vue-i18n'
import messages from '@/assets/js/messages'

const vuetify = new Vuetify()
const localVue = createLocalVue()

Vue.use(Vuex)
Vue.use(Vuetify)
Vue.use(VueI18n)

const translationMock = (key) => messages.en[key]
const countTranslationMock = (key, count) => messages.en[key]

config.mocks.$t = translationMock
config.mocks.$tc = countTranslationMock
config.mocks.$i18n = {
  locale: 'en',
  locales: ['en'],
  t: translationMock,
  tc: countTranslationMock,
}
config.mocks.$store = {
  commit: () => {
    // empty
  },
}
config.mocks.$auth = {
  user: {
    username: 'test',
  },
}

config.stubs.NuxtLink = true
config.stubs.DocumentList = true
config.stubs.UploadButton = true

config.mocks.localePath = (s) => s
config.mocks.localeRoute = (s) => s

const shallowMount = (component, options) =>
  baseShallowMount(component, { ...options }, vuetify, localVue)
const mount = (component, options) =>
  baseMount(component, { ...options }, vuetify, localVue)

export { shallowMount, mount, routerLinkStub }
