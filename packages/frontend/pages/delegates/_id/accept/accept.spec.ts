import { shallowMount } from '@vue/test-utils'
import Accept from '@/pages/delegates/_id/accept/index.vue'
import Layout from '@/layouts/default.vue'

describe('Accept component', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(Accept, {
      stubs: { Layout },
      mocks: {
        $route: {
          params: {},
        },
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
