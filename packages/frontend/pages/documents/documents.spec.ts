import Vuex from 'vuex'
import { shallowMount } from '@vue/test-utils'
import Documents from '@/pages/documents/index.vue'
import Layout from '@/layouts/default.vue'

describe('Documents component', () => {
  let store: any
  let actions
  beforeEach(() => {
    actions = {
      getDocuments: () => Promise.resolve([]),
    }
    store = new Vuex.Store({
      actions,
    })
  })

  it('exports a valid page', () => {
    const wrapper = shallowMount(Documents, {
      store,
      stubs: { Layout },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
