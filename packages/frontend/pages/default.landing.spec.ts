import { shallowMount } from '@vue/test-utils'
import Landing from '@/pages/index.vue'
import Layout from '@/layouts/centered.vue'

jest.mock('@/plugins/store-accessor', () => ({
  userStore: {
    role: 0,
  },
}))

describe('Default landing page', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(Landing, {
      stubs: { Layout },
      mocks: {
        $router: {
          push: () => {
            // do nothing
          },
        },
      },
    })
    expect(wrapper.html()).toBeTruthy()
    // expect(true).toBe(true)
  })
})
