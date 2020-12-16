import { shallowMount } from '@vue/test-utils'
import Logout from '@/pages/logout/index.vue'

describe('Logout component', () => {
  it('exports a valid page', () => {
    const $auth = { logout: jest.fn() }
    const wrapper = shallowMount(Logout, {
      mocks: {
        $auth,
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
