import { shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import Layout from '@/layouts/default.vue'
import ClientDashboard from '@/components/ClientDashboard/ClientDashboard.vue'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    documents: [],
  },
}))

describe('ClientDashboard component', () => {
  let store: any
  let actions
  beforeEach(() => {
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
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
