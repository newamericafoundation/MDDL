import { shallowMount } from '@vue/test-utils'
import DocumentMenu from '@/components/DocumentMenu/DocumentMenu.vue'

describe('DocumentMenu component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(DocumentMenu)
    expect(wrapper.html()).toBeTruthy()
  })
})
