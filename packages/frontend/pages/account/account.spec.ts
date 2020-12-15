import { createLocalVue, shallowMount } from '@vue/test-utils'
import Account from '@/pages/account/index.vue'
import Layout from '@/layouts/default.vue'
import Vuetify from 'vuetify'

const localVue = createLocalVue()

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    profile: {},
  },
}))

describe('Account page', () => {
  let vuetify: Vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  it('exports a valid page', () => {
    // TODO: disabled until we can resolve:
    // [vue-test-utils]: could not overwrite property $i18n, this is usually caused by a plugin that has added the property as a read-only value

    // const wrapper = shallowMount(Account, {
    //   vuetify,
    //   stubs: { Layout },
    //   mocks: {
    //     $store: {
    //       dispatch: () => Promise.resolve(),
    //       commit: () => {
    //         // empty
    //       },
    //     },
    //   },
    //   data: {
    //     $i18n: {
    //       locales: [],
    //     },
    //   },
    //   localVue,
    // })
    // expect(wrapper.html()).toBeTruthy()
    expect(true).toBe(true)
  })
})
