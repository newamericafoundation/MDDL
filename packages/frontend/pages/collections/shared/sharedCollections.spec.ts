import { shallowMount } from '@vue/test-utils'
import SharedCollections from '@/pages/collections/shared/index.vue'
import Layout from '@/layouts/default.vue'

describe('SharedCollections page', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(SharedCollections, { stubs: { Layout } })
    expect(wrapper.html()).toBeTruthy()
  })
})
