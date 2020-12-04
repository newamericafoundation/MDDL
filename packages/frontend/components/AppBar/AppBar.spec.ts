import { shallowMount } from '@vue/test-utils'
import AppBar from '@/components/AppBar/AppBar.vue'
import Vuetify from 'vuetify'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    isCbo: false,
    isAgent: false,
    isClient: true,
  },
}))

describe('AppBar component', () => {
  let vuetify: Vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  it('exports a valid component', () => {
    const wrapper = shallowMount(AppBar, {
      vuetify,
    })
    expect(wrapper.html()).toBeTruthy()
    expect(true).toBe(true)
  })
})
