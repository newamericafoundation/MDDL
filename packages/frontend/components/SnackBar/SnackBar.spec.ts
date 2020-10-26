import { shallowMount } from '@vue/test-utils'
import SnackBar from '@/components/SnackBar/SnackBar.vue'

jest.mock('@/plugins/store-accessor', () => ({
  snackbarStore: {},
}))

describe('SnackBar component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(SnackBar, {})
    expect(wrapper.html()).toBeTruthy()
  })
})
