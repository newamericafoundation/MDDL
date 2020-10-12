import { shallowMount } from '@vue/test-utils'
import AppBar from '@/components/AppBar/AppBar.vue'

describe('AppBar component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(AppBar)
    expect(wrapper.html()).toBeTruthy()
  })
})
