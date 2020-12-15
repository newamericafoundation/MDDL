import { shallowMount } from '@vue/test-utils'
import LandingMessage from '@/components/LandingMessage/LandingMessage.vue'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    role: 0,
  },
}))

describe('LandingMessage component', () => {
  it('exports a valid component', () => {
    const $config = { footerLogo: '1' }

    const wrapper = shallowMount(LandingMessage, {
      mocks: {
        $config,
        $auth: {
          loggedIn: true,
        },
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
