import { shallowMount } from '@vue/test-utils'
import SharedOwnerList from '@/components/SharedOwnerList/SharedOwnerList.vue'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    sharedCollections: [],
  },
}))

describe('SharedOwnerList component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(SharedOwnerList, {
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
