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
import messages from '@/locales/messages'

const vuetify = new Vuetify()
const localVue = createLocalVue()

Vue.use(Vuex)
Vue.use(Vuetify)
localVue.use(Vuetify)
localVue.use(VueI18n)

config.mocks.$t = (key: string) => messages.en[key as keyof typeof messages.en]
config.mocks.$i18n = {
  locale: 'en',
  locales: ['en'],
}

const shallowMount = (component: any, options?: any) =>
  baseShallowMount(component, { ...options, localVue })
const mount = (component: any, options?: any) =>
  baseMount(component, { ...options, localVue })

export { localVue, shallowMount, mount, vuetify, Vue, routerLinkStub }
