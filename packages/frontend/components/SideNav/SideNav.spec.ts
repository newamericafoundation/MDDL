import { shallowMount } from '@vue/test-utils'
import SideNav from '@/components/SideNav/SideNav.vue'
import Vuetify from 'vuetify'

jest.mock('@/plugins/store-accessor', () => ({
  navBarStore: {
    side: true,
  },
  userStore: {
    role: 0,
  },
}))

describe('SideNav component', () => {
  let vuetify: Vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  it('exports a valid component', () => {
    const wrapper = shallowMount(SideNav, {
      mocks: {
        $config: {},
      },
      vuetify,
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
