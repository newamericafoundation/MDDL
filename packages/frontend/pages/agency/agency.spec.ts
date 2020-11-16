import { shallowMount } from '@vue/test-utils'
import Agency from '@/pages/agency/index.vue'
import Layout from '@/layouts/default.vue'

describe('Agency component', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(Agency, { stubs: { Layout } })
    expect(wrapper.html()).toBeTruthy()
  })
})
