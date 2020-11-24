import { shallowMount } from '@vue/test-utils'
import DelegateCard from '@/components/DelegateCard/DelegateCard.vue'

describe('DelegateCard component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(DelegateCard, {
      propsData: {
        delegate: {},
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
