/* eslint-disable import/no-mutable-exports */

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import user from '@/store/user'
import DocumentStore from '@/store/document'
// import insertion point (do not change this text, it is being used by hygen cli)

let userStore: user
let documentStore: DocumentStore
// variable insertion point (do not change this text, it is being used by hygen cli)

export default ({ store }: { store: Store<any> }) => {
  userStore = getModule(user, store)
  documentStore = getModule(DocumentStore, store)
  // extractVuexModule insertion point (do not change this text, it is being used by hygen cli)
}

export {
  userStore,
  documentStore,
  // export insertion point (do not change this text, it is being used by hygen cli)
}
