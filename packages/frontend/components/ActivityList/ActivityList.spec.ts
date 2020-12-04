import { shallowMount } from '@vue/test-utils'
import ActivityList from '@/components/ActivityList/ActivityList.vue'

describe('ActivityList component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(ActivityList)
    expect(wrapper.html()).toBeTruthy()
  })
})
