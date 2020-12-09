import { shallowMount } from '@vue/test-utils'
import CollectionCard from '@/components/CollectionCard/CollectionCard.vue'
import Vuetify from 'vuetify'

describe('CollectionCard component', () => {
  let vuetify: Vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  it('exports a valid component', () => {
    const wrapper = shallowMount(CollectionCard, {
      vuetify,
      propsData: {
        collection: {
          name: 'test',
          id: '1',
          createdDate: '2020-01-02T10:11:12.345Z',
          links: [],
        },
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
