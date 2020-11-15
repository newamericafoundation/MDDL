import { shallowMount } from '@vue/test-utils'
import Authorize from '@/pages/authorize/index.vue'

describe('Page/Authorize', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(Authorize)
    expect(wrapper.html()).toBeTruthy()
  })
})
