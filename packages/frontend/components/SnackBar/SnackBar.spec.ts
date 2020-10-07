import { shallowMount } from '@vue/test-utils'
import SnackBar from '@/components/SnackBar/SnackBar.vue'

describe('SnackBar component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(SnackBar, {
      propsData: {
        value: true,
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
