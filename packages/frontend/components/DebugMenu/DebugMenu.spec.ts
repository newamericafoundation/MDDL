import { shallowMount } from '@vue/test-utils'
import DebugMenu from '@/components/DebugMenu/DebugMenu.vue'

describe('DebugMenu component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(DebugMenu, {
      mocks: {
        $store: {
          dispatch: () => Promise.resolve([]),
          commit: () => {
            // empty
          },
          getters: {},
        },
      },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
