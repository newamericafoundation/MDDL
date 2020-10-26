import { shallowMount } from '@vue/test-utils'
import SharedCollectionList from '@/components/SharedCollectionList/SharedCollectionList.vue'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    collections: [],
  },
}))

describe('SharedCollectionList component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(SharedCollectionList, {
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
