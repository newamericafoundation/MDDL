import { shallowMount } from '@vue/test-utils'
import CboDashboard from '@/components/CboDashboard/CboDashboard.vue'

describe('CboDashboard component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(CboDashboard, {
      mocks: {
        $route: {
          query: {},
        },
        $t: () => 'a{close}b',
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
