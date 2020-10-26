import { shallowMount } from '@vue/test-utils'
import CollectionList from '@/components/CollectionList/CollectionList.vue'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    collections: [],
  },
}))

describe('CollectionList component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(CollectionList, {
      mocks: {
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
