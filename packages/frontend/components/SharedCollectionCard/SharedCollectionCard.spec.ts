import { shallowMount } from '@vue/test-utils'
import SharedCollectionCard from '@/components/SharedCollectionCard/SharedCollectionCard.vue'
import Vuetify from 'vuetify'

describe('SharedCollectionCard component', () => {
  let vuetify: Vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })
  it('exports a valid component', () => {
    const wrapper = shallowMount(SharedCollectionCard, {
      vuetify,
      propsData: {
        collectionListItem: {
          collection: {
            name: 'test',
          },
          owner: {
            familyName: 'Testman',
            givenName: 'Testy',
            name: 'Testy Testman',
          },
        },
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
