import { shallowMount } from '@vue/test-utils'
import Client from '@/pages/client/index.vue'
import Layout from '@/layouts/default.vue'

describe('Client component', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(Client, { stubs: { Layout } })
    expect(wrapper.html()).toBeTruthy()
  })
})
