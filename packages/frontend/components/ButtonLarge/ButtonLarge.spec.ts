import { shallowMount } from '@vue/test-utils'
import ButtonLarge from '@/components/ButtonLarge/ButtonLarge.vue'

describe('ButtonLarge component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(ButtonLarge)
    expect(wrapper.html()).toBeTruthy()
  })
})
