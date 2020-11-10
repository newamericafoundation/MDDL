import { shallowMount } from '@vue/test-utils'
import SnackBar from '@/components/SnackBar/SnackBar.vue'
import Vuetify from 'vuetify'

jest.mock('@/plugins/store-accessor', () => ({
  snackbarStore: {},
}))

describe('SnackBar component', () => {
  let vuetify: Vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })
  it('exports a valid component', () => {
    const wrapper = shallowMount(SnackBar, {
      vuetify,
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
