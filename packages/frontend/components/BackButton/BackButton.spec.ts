import { shallowMount } from '@vue/test-utils'
import BackButton from '@/components/BackButton/BackButton.vue'

describe('BackButton component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(BackButton)
    expect(wrapper.html()).toBeTruthy()
  })
})
