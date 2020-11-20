import { shallowMount } from '@vue/test-utils'
import ClientList from '@/components/ClientList/ClientList.vue'

describe('ClientList component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(ClientList, {
      mocks: {
        $store: {
          dispatch: () => Promise.resolve(),
          commit: () => {
            // empty
          },
        },
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
