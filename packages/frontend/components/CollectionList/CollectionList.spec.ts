import { createLocalVue, mount } from '@vue/test-utils'
import CollectionList from '@/components/CollectionList/CollectionList.vue'
import Vuetify from 'vuetify'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    collections: [],
  },
}))

const localVue = createLocalVue()

describe('CollectionList component', () => {
  let vuetify: Vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  it('exports a valid component', () => {
    const wrapper = mount(CollectionList, {
      vuetify,
      mocks: {
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
