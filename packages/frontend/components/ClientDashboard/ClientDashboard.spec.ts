import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Layout from '@/layouts/default.vue'
import ClientDashboard from '@/components/ClientDashboard/ClientDashboard.vue'
import Vuetify from 'vuetify'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    documents: [],
  },
}))

const localVue = createLocalVue()

describe('ClientDashboard component', () => {
  let store: any
  let actions
  let vuetify: Vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
    actions = {
      getDocuments: () => Promise.resolve([]),
    }
    store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          actions,
          mutations: {
            setUserId: () => Promise.resolve(),
          },
        },
      },
    })
  })

  it('exports a valid component', () => {
    const wrapper = shallowMount(ClientDashboard, {
      vuetify,
      store,
      stubs: { Layout },
      mocks: {
        $route: {
          query: {},
        },
        $store: {
          dispatch: () => [],
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
