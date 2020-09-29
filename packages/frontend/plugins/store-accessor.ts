/* eslint-disable import/no-mutable-exports */

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import user from '@/store/user'
// import insertion point (do not change this text, it is being used by hygen cli)

let userStore: user
// variable insertion point (do not change this text, it is being used by hygen cli)

export default ({ store }: { store: Store<any> }) => {
  userStore = getModule(user, store)
  // extractVuexModule insertion point (do not change this text, it is being used by hygen cli)
}

export {
  userStore,
  // export insertion point (do not change this text, it is being used by hygen cli)
}
