import { shallowMount } from '@vue/test-utils'
import AgentDashboard from '@/components/AgentDashboard/AgentDashboard.vue'
import Layout from '@/layouts/default.vue'

describe('AgentDashboard page', () => {
  it('exports a valid page', () => {
    const wrapper = shallowMount(AgentDashboard, { stubs: { Layout } })
    expect(wrapper.html()).toBeTruthy()
  })
})
