import { shallowMount } from '@vue/test-utils'
import UploadButton from '@/components/UploadButton/UploadButton.vue'

describe('UploadButton component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(UploadButton)
    expect(wrapper.html()).toBeTruthy()
  })
})
