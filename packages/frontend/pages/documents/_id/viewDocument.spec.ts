import Vuex from 'vuex'
import { shallowMount } from '@vue/test-utils'
import ViewDocument from '@/pages/documents/_id/index.vue'
import Layout from '@/layouts/default.vue'
import flushPromises from 'flush-promises'
import Vuetify from 'vuetify'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    isCbo: false,
    isAgent: false,
    isClient: true,
  },
}))

describe('Documents component', () => {
  let store: any
  let vuetify: Vuetify

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        document: {
          actions: {
            getById: () =>
              Promise.resolve({
                name: 'test doc',
                id: '1',
                createdDate: '2020-01-02T10:11:12.345Z',
                files: [
                  {
                    id: '1',
                    contentLength: 1000000,
                  },
                ],
              }),
            update: () => Promise.resolve(),
          },
          namespaced: true,
        },
      },
    })
    vuetify = new Vuetify()
  })

  it('exports a valid page', async () => {
    const wrapper = shallowMount(ViewDocument, {
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
      vuetify,
    })
    await flushPromises()
    expect(wrapper.html()).toBeTruthy()
  })
})
