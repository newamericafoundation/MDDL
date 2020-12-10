import { shallowMount } from '@vue/test-utils'
import Faq from '@/pages/faq/index.vue'

describe('FAQ Page', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(Faq)
    expect(wrapper.html()).toBeTruthy()
  })
})
