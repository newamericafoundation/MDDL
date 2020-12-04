import { shallowMount } from '@vue/test-utils'
import DocumentActions from '@/components/DocumentActions/DocumentActions.vue'

describe('DocumentActions component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(DocumentActions)
    expect(wrapper.html()).toBeTruthy()
  })
})
