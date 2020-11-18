import { shallowMount } from '@vue/test-utils'
import Account from '@/pages/account/index.vue'
import Layout from '@/layouts/default.vue'

describe('Account page', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(Account, {
      stubs: { Layout },
      mocks: {
        $store: {
          dispatch: () => Promise.resolve(),
          commit: () => {
            // empty
          },
        },
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
