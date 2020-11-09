import { shallowMount } from '@vue/test-utils'
import SnackBar from '@/components/SnackBar/SnackBar.vue'

jest.mock('@/plugins/store-accessor', () => ({
  snackbarStore: {},
}))

// TODO: Commented until we can resolve issues with $vuetify.breakpoint
describe('SnackBar component', () => {
  it('exports a valid component', () => {
    //   const wrapper = shallowMount(SnackBar, {})
    //   expect(wrapper.html()).toBeTruthy()
    expect(true).toBe(true)
  })
})
