import { shallowMount } from '@vue/test-utils'
import DocumentList from '@/components/DocumentList/DocumentList.vue'
import Vuetify from 'vuetify'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    documents: [],
  },
}))

describe('DocumentList component', () => {
  let vuetify: Vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })
  it('exports a valid component', () => {
    const wrapper = shallowMount(DocumentList, {
      mocks: {
        $store: {
          dispatch: () => [],
          commit: () => {
            // empty
          },
        },
      },
      vuetify,
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
