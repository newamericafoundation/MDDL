/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'

import { Document } from 'api-client'
import ViewDocument from './index.vue'

const fullDoc = {
  name: 'Document one',
  id: '1',
}

const fullUserStore = new Vuex.Store({
  modules: {
    document: {
      namespaced: true,
      actions: {
        getById() {
          return new Promise(resolve => resolve(fullDoc))
        },
        update(_context: any, updated: Document) {
          fullDoc.name = updated.name!
          return new Promise(resolve => {
            window.setTimeout(resolve, 100)
          })
        },
      },
    },
  },
})

storiesOf('View Document', module).add('Default', () => ({
  components: { ViewDocument },
  store: fullUserStore,
  template: '<ViewDocument />',
  data() {
    return {
      $route: {
        params: {
          id: '1',
        },
      },
    }
  },
}))

const emptyDoc = {
  name: '',
  id: '2',
}

const emptyUserStore = new Vuex.Store({
  modules: {
    document: {
      namespaced: true,
      actions: {
        getById() {
          return new Promise(resolve => resolve(emptyDoc))
        },
        update(_context: any, updated: Document) {
          emptyDoc.name = updated.name!
          return new Promise(resolve => {
            window.setTimeout(resolve, 100)
          })
        },
      },
    },
  },
})

storiesOf('View Document', module).add('Empty', () => ({
  components: { ViewDocument },
  store: emptyUserStore,
  template: '<ViewDocument />',
  data() {
    return {
      $route: {
        params: {
          id: '1',
        },
      },
    }
  },
}))
