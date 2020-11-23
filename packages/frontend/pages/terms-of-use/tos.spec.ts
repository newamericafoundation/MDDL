import { createLocalVue, shallowMount } from '@vue/test-utils'
import TermsOfUse from '@/pages/terms-of-use/index.vue'
import Layout from '@/layouts/default.vue'
import Vuetify from 'vuetify'

const localVue = createLocalVue()

describe('TermsOfUse component', () => {
  let vuetify: Vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  it('exports a valid page', () => {
    const wrapper = shallowMount(TermsOfUse, {
      vuetify,
      stubs: { Layout },
      localVue,
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
