import { shallowMount } from '@vue/test-utils'
import DocumentList from '@/components/DocumentList/DocumentList.vue'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    documents: [],
  },
}))

describe('DocumentList component', () => {
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
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
