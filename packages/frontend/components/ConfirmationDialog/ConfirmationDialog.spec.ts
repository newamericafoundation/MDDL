import { shallowMount } from '@vue/test-utils'
import ConfirmationDialog from '@/components/ConfirmationDialog/ConfirmationDialog.vue'

describe('ConfirmationDialog component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(ConfirmationDialog)
    expect(wrapper.html()).toBeTruthy()
  })
})
