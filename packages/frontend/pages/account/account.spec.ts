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
    const wrapper = shallowMount(Account, {
      vuetify,
      stubs: { Layout },
      mocks: {
        $store: {
          dispatch: () => Promise.resolve(),
          commit: () => {
            // empty
          },
        },
      },
      localVue,
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
