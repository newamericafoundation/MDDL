import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'
import Documents from './index.vue'

const fullUserStore = new Vuex.Store({
  actions: {
    getDocuments() {
      return [
        {
          name: 'Document one',
          id: '1'
        },
        {
          name: 'Document two',
          id: '2'
        },
        {
          name: 'Document three',
          id: '3'
        }
      ]
    }
  }
})

storiesOf('Documents Page', module).add('Default', () => ({
  components: { Documents },
  store: fullUserStore,
  template: '<Documents />'
}))

const emptyUserStore = new Vuex.Store({
  actions: {
    getDocuments() {
      return []
    }
  }
})

storiesOf('Documents Page', module).add('Empty', () => ({
  components: { Documents },
  store: emptyUserStore,
  template: '<Documents />'
}))
