import { shallowMount } from '@vue/test-utils'
import Account from '@/pages/account/index.vue'
import Layout from '@/layouts/default.vue'

describe('Account component', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(Account, { stubs: { Layout } })
    expect(wrapper.html()).toBeTruthy()
  })
})
