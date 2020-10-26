import { shallowMount } from '@vue/test-utils'
import Share from '@/pages/share/index.vue'
import Layout from '@/layouts/default.vue'

describe('Share component', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(Share, {
      stubs: { Layout },
      mocks: {
        $route: {
          params: {
            id: '1',
          },
        },
        $store: {
          dispatch: () => '',
        },
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
