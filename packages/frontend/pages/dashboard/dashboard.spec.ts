import Vuex from 'vuex'
import { shallowMount } from '@vue/test-utils'
import Dashboard from '@/pages/dashboard/index.vue'
import Layout from '@/layouts/default.vue'

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
        },
      },
    })
  })

  it('exports a valid page', () => {
    const wrapper = shallowMount(Dashboard, {
      store,
      stubs: { Layout },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
