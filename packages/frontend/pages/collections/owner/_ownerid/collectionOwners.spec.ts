import Vuex from 'vuex'
import { shallowMount } from '@vue/test-utils'
import CollectionOwners from '@/pages/collections/owner/_ownerid/index.vue'
import Layout from '@/layouts/default.vue'
import flushPromises from 'flush-promises'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    collections: [],
    sharedCollections: [],
  },
}))

describe('Collections by owner', () => {
  let store: any
  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        collection: {
          actions: {
            getDocuments: () => Promise.resolve([]),
          },
          namespaced: true,
        },
      },
    })
  })

  it('exports a valid page', async () => {
    const wrapper = shallowMount(CollectionOwners, {
      store,
      stubs: { Layout },
      mocks: {
        $route: {
          params: {
            id: '1',
          },
        },
        $store: {
          dispatch: () => '',
        },
      },
    })
    await flushPromises()
    expect(wrapper.html()).toBeTruthy()
  })
})
