import { shallowMount } from '@vue/test-utils'
import DocumentCard from '@/components/DocumentCard/DocumentCard.vue'
import Vuetify from 'vuetify'

describe('DocumentCard component', () => {
  let vuetify: Vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  it('exports a valid component', () => {
    const wrapper = shallowMount(DocumentCard, {
      vuetify,
      propsData: {
        document: {
          name: 'test',
          id: '1',
          createdDate: '2020-01-02T10:11:12.345Z',
          links: [],
        },
        value: [],
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
