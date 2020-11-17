import { shallowMount } from '@vue/test-utils'
import Activity from '@/pages/activity/index.vue'
import Layout from '@/layouts/default.vue'

describe('Activity page', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(Activity, { stubs: { Layout } })
    expect(wrapper.html()).toBeTruthy()
  })
})
