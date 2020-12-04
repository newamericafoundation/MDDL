import { shallowMount } from '@vue/test-utils'
import DesktopSideBar from '@/components/DesktopSideBar/DesktopSideBar.vue'

describe('DesktopSideBar component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(DesktopSideBar)
    expect(wrapper.html()).toBeTruthy()
  })
})
