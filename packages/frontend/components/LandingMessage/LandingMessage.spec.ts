import { shallowMount } from '@vue/test-utils'
import LandingMessage from '@/components/LandingMessage/LandingMessage.vue'
import Vuetify from 'vuetify'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    role: 0,
  },
}))

describe('LandingMessage component', () => {
  let vuetify: Vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  it('exports a valid component', () => {
    const $config = { footerLogo: '1' }

    const wrapper = shallowMount(LandingMessage, {
      vuetify,
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
