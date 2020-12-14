import { shallowMount } from '@vue/test-utils'
import LandingMessage from '@/components/LandingMessage/LandingMessage.vue'

describe('LandingMessage component', () => {
  it('exports a valid component', () => {
    const $config = { footerLogo: '1' }

    const wrapper = shallowMount(LandingMessage, {
      mocks: {
        $config,
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
