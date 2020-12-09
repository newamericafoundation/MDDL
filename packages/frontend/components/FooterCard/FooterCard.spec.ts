import { shallowMount } from '@vue/test-utils'
import FooterCard from '@/components/FooterCard/FooterCard.vue'

describe('FooterCard component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(FooterCard)
    expect(wrapper.html()).toBeTruthy()
  })
})
