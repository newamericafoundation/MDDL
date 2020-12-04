import { shallowMount } from '@vue/test-utils'
import ShareButton from '@/components/ShareButton/ShareButton.vue'

describe('ShareButton component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(ShareButton)
    expect(wrapper.html()).toBeTruthy()
  })
})
