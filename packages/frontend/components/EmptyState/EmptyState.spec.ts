import { shallowMount } from '@vue/test-utils'
import EmptyState from '@/components/EmptyState/EmptyState.vue'

describe('EmptyState component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(EmptyState)
    expect(wrapper.html()).toBeTruthy()
  })
})
