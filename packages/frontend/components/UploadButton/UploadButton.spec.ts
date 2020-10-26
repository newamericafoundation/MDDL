import { shallowMount } from '@vue/test-utils'
import UploadButton from '@/components/UploadButton/UploadButton.vue'

jest.mock('@/plugins/store-accessor', () => ({
  snackbarStore: {},
}))

describe('UploadButton component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(UploadButton)
    expect(wrapper.html()).toBeTruthy()
  })
})
