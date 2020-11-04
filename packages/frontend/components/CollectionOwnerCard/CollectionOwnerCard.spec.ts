import { shallowMount } from '@vue/test-utils'
import CollectionOwnerCard from '@/components/CollectionOwnerCard/CollectionOwnerCard.vue'

describe('CollectionOwnerCard component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(CollectionOwnerCard)
    expect(wrapper.html()).toBeTruthy()
  })
})
