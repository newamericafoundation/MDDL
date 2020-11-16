import { shallowMount } from '@vue/test-utils'
import LandingMessage from '@/components/LandingMessage/LandingMessage.vue'

describe('LandingMessage component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(LandingMessage)
    expect(wrapper.html()).toBeTruthy()
  })
})
