import { shallowMount } from '@vue/test-utils'
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.vue'

describe('Breadcrumbs component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(Breadcrumbs)
    expect(wrapper.html()).toBeTruthy()
  })
})
