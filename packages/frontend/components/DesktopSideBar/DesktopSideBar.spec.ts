import { createLocalVue, shallowMount } from '@vue/test-utils'
import DesktopSideBar from '@/components/DesktopSideBar/DesktopSideBar.vue'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
describe('DesktopSideBar component', () => {
  let vuetify: Vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })
  it('exports a valid component', () => {
    const wrapper = shallowMount(DesktopSideBar, {
      vuetify,
      localVue,
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
