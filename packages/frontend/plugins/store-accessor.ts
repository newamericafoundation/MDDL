/* eslint-disable import/no-mutable-exports */

import VueAnalytics from 'vue-analytics'
import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import user from '@/store/user'
import DocumentStore from '@/store/document'
import collection from '@/store/collection'
import snackbar from '@/store/snackbar'
import delegate from '@/store/delegate'
import navBar from '@/store/navBar'
// import insertion point (do not change this text, it is being used by hygen cli)

let userStore: user
let documentStore: DocumentStore
let collectionStore: collection
let snackbarStore: snackbar
let delegateStore: delegate
let navBarStore: navBar
// variable insertion point (do not change this text, it is being used by hygen cli)

export default ({ store, $ga }: { store: Store<any>; $ga: VueAnalytics }) => {
  userStore = getModule(user, store)
  userStore.$ga = $ga
  documentStore = getModule(DocumentStore, store)
  documentStore.$ga = $ga
  collectionStore = getModule(collection, store)
  collectionStore.$ga = $ga
  snackbarStore = getModule(snackbar, store)
  snackbarStore.$ga = $ga
  delegateStore = getModule(delegate, store)
  delegateStore.$ga = $ga
  navBarStore = getModule(navBar, store)
  navBarStore.$ga = $ga
  // getModule insertion point (do not change this text, it is being used by hygen cli)
}

export {
  userStore,
  documentStore,
  collectionStore,
  snackbarStore,
  delegateStore,
  navBarStore,
  // export insertion point (do not change this text, it is being used by hygen cli)
}
