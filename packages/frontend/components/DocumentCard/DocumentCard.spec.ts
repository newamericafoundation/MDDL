import { shallowMount } from '@vue/test-utils'
import DocumentCard from '@/components/DocumentCard/DocumentCard.vue'

describe('DocumentCard component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(DocumentCard, {
      propsData: {
        document: {
          name: 'test',
          id: '1',
        },
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
