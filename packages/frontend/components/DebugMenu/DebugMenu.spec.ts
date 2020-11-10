import { shallowMount } from '@vue/test-utils'
import DebugMenu from '@/components/DebugMenu/DebugMenu.vue'

describe('DebugMenu component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(DebugMenu)
    expect(wrapper.html()).toBeTruthy()
  })
})
