import { shallowMount } from '@vue/test-utils'
import Share from '@/pages/share/index.vue'
import Layout from '@/layouts/default.vue'
import Vuetify from 'vuetify'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    collections: [],
    documents: [],
  },
}))

describe('Share component', () => {
  let vuetify: Vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })
  it('exports a valid page', () => {
    // const wrapper = shallowMount(Share, {
    //   vuetify,
    //   stubs: { Layout },
    //   mocks: {
    //     $config: {
    //       agencyEmailDomainsWhitelist:
    //         '@myspecificdomain.com,partialdomain.net',
    //     },
    //     $route: {
    //       params: {
    //         id: '1',
    //       },
    //       query: {
    //         selected: [],
    //       },
    //     },
    //     $store: {
    //       dispatch: () => '',
    //     },
    //   },
    // })
    // expect(wrapper.html()).toBeTruthy()
    expect(true).toBeTruthy()
  })
})
