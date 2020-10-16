import { shallowMount } from '@vue/test-utils'
import Login from '@/pages/login/index.vue'

describe('Page/Login', () => {
  it('exports a valid page', () => {
    const loginWith = jest.fn()
    const $auth = { loginWith }
    const wrapper = shallowMount(Login, {
      mocks: {
        $auth,
      },
    })
    expect(loginWith.mock.calls.length).toBe(1)
    expect(wrapper.html()).toBeTruthy()
  })
})
