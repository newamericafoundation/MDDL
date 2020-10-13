import { shallowMount } from '@vue/test-utils'
import DocumentCard from '@/components/DocumentCard/DocumentCard.vue'

describe('DocumentCard component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(DocumentCard, {
      propsData: {
        document: {
          name: 'test',
          id: '1',
          createdDate: '2020-01-02T10:11:12.345Z',
        },
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
