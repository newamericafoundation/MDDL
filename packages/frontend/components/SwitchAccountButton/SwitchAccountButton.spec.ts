import { shallowMount } from '@vue/test-utils'
import SwitchAccountButton from '@/components/SwitchAccountButton/SwitchAccountButton.vue'

describe('SwitchAccountButton component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(SwitchAccountButton)
    expect(wrapper.html()).toBeTruthy()
  })
})
