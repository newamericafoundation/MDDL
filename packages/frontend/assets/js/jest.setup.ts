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

const localVue = createLocalVue()

Vue.use(Vuex)
localVue.use(VueI18n)

config.mocks.$t = (key: string) => messages.en[key as keyof typeof messages.en]
config.mocks.$i18n = {
  locale: 'en',
  locales: ['en'],
  t: (s: string) => s,
}

// TODO: apparently jest and vuetify have issues with $vuetify.breakpoint
// see https://github.com/vuetifyjs/vuetify/issues/11278
config.mocks.$vuetify = {
  breakpoint: {
    xs: true,
  },
}

config.mocks.localePath = (s: string) => s

const shallowMount = (component: any, options?: any) =>
  baseShallowMount(component, { ...options, localVue })
const mount = (component: any, options?: any) =>
  baseMount(component, { ...options, localVue })

export { localVue, shallowMount, mount, Vue, routerLinkStub }
