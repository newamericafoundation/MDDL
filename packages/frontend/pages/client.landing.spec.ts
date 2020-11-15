import { shallowMount } from '@vue/test-utils'
import Landing from '@/pages/index.vue'
import Layout from '@/layouts/centered.vue'

describe('Client landing page', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(Landing, { stubs: { Layout } })
    expect(wrapper.html()).toBeTruthy()
  })
})
