import { shallowMount } from '@vue/test-utils'
import DocumentFile from '@/components/DocumentFile/DocumentFile.vue'

describe('DocumentFile component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(DocumentFile)
    expect(wrapper.html()).toBeTruthy()
  })
})
