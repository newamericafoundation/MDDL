import { shallowMount } from '@vue/test-utils'
import DocumentThumbnail from '@/components/DocumentThumbnail/DocumentThumbnail.vue'

describe('DocumentThumbnail component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(DocumentThumbnail)
    expect(wrapper.html()).toBeTruthy()
  })
})
