import Vuex from 'vuex'
import { shallowMount } from '@vue/test-utils'
import Dashboard from '@/pages/dashboard/index.vue'
import Layout from '@/layouts/default.vue'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    role: 0,
    isActingAsDelegate: false,
    isCbo: false,
    isAgent: false,
    isClient: true,
  },
  snackbarStore: {
    setVisible: (v: boolean) => {
      // empty
    },
  },
}))

describe('Page/Dashboard', () => {
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

  it('exports a valid page', () => {
    const wrapper = shallowMount(Dashboard, {
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
