import { shallowMount } from '@vue/test-utils'
import Community from '@/pages/community/index.vue'
import Layout from '@/layouts/default.vue'

describe('Community component', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(Community, { stubs: { Layout } })
    expect(wrapper.html()).toBeTruthy()
  })
})
