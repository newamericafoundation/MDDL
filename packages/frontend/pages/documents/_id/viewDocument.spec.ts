import Vuex from 'vuex'
import { shallowMount } from '@vue/test-utils'
import ViewDocument from '@/pages/documents/_id/index.vue'
import Layout from '@/layouts/default.vue'
import flushPromises from 'flush-promises'

describe('Documents component', () => {
  let store: any
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
      },
    })
    await flushPromises()
    expect(wrapper.html()).toBeTruthy()
  })
})
