import { shallowMount } from '@vue/test-utils'
import SharedCollectionDetails from '@/components/SharedCollectionDetails/SharedCollectionDetails.vue'

describe('SharedCollectionDetails component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(SharedCollectionDetails, {
      propsData: {
        collection: {
          owner: {},
          shareInformation: {
            sharedBy: {
              id: 'abcde',
              email: 'test@name.com',
              name: 'test name',
            },
            sharedDate: '2020-12-15T02:58:41.000Z',
          },
          collection: {},
        },
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
