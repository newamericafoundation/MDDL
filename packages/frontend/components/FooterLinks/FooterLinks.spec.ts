import { shallowMount, createLocalVue } from '@vue/test-utils'
import FooterLinks from '@/components/FooterLinks/FooterLinks.vue'
import Vuetify from 'vuetify'

const localVue = createLocalVue()

describe('FooterLinks component', () => {
  let vuetify: Vuetify
  beforeEach(() => {
    vuetify = new Vuetify()
  })

  it('exports a valid component', () => {
    const wrapper = shallowMount(FooterLinks, {
      localVue,
      vuetify,
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
