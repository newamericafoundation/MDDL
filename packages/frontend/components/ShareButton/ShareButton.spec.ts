import { shallowMount } from '@vue/test-utils'
import ShareButton from '@/components/ShareButton/ShareButton.vue'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    isCbo: false,
    isAgent: false,
    isClient: true,
  },
}))

describe('ShareButton component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(ShareButton)
    expect(wrapper.html()).toBeTruthy()
  })
})
