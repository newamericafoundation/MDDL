import { shallowMount } from '@vue/test-utils'
import NavItemList from '@/components/NavItemList/NavItemList.vue'

describe('NavItemList component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(NavItemList)
    expect(wrapper.html()).toBeTruthy()
  })
})
